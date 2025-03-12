import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash, compare } from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { UpdateUserData } from "@/types";

const profileSchema = z.object({
    name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
    email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein").optional(),
});

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Nicht authentifiziert" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, currentPassword, newPassword } = profileSchema.parse(body);

        // Überprüfen, ob die E-Mail bereits von einem anderen Benutzer verwendet wird
        const existingUserWithEmail = await prisma.user.findFirst({
            where: {
                email,
                id: {
                    not: session.user.id,
                },
            },
        });

        if (existingUserWithEmail) {
            return NextResponse.json({ message: "E-Mail wird bereits verwendet" }, { status: 409 });
        }

        // Aktuellen Benutzer abrufen
        const currentUser = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
        });

        if (!currentUser) {
            return NextResponse.json({ message: "Benutzer nicht gefunden" }, { status: 404 });
        }

        // Wenn ein neues Passwort gesetzt werden soll, das aktuelle Passwort überprüfen
        if (newPassword && currentPassword) {
            const isPasswordValid = await compare(currentPassword, currentUser.password);

            if (!isPasswordValid) {
                return NextResponse.json({ message: "Aktuelles Passwort ist falsch" }, { status: 400 });
            }
        }

        // Benutzer aktualisieren
        const updateData: UpdateUserData = {
            name,
            email,
        };

        if (newPassword) {
            updateData.password = await hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: updateData,
        });

        // Sensible Daten entfernen bevor sie zurückgegeben werden
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({
            message: "Profil erfolgreich aktualisiert",
            user: userWithoutPassword,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
        }

        console.error("Fehler beim Aktualisieren des Profils:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}
