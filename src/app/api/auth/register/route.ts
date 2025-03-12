import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

const userSchema = z.object({
    name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
    email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
    password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = userSchema.parse(body);

        // Überprüfen, ob die E-Mail bereits existiert
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUserByEmail) {
            return NextResponse.json({ message: "E-Mail wird bereits verwendet" }, { status: 409 });
        }

        // Passwort hashen
        const hashedPassword = await hash(password, 10);

        // Benutzer erstellen
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Sensible Daten entfernen bevor sie zurückgegeben werden
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            {
                message: "Benutzer erfolgreich registriert",
                user: userWithoutPassword,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
        }

        console.error("Registrierungsfehler:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}
