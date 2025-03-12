// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Nicht authentifiziert" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "Keine Datei hochgeladen" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Eindeutigen Dateinamen erzeugen
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;

        // Stelle sicher, dass der Ordner existiert
        const uploadsDir = join(process.cwd(), "public", "uploads");

        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        await writeFile(join(uploadsDir, fileName), buffer);

        // Persistente URL zurückgeben (relativ zu /public)
        return NextResponse.json({ url: `/uploads/${fileName}` });
    } catch (error) {
        console.error("Fehler beim Hochladen:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}
