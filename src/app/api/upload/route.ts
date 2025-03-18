// src/app/api/upload/route.ts (korrigierte Version)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";

// Maximale Dateigröße (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Erlaubte Dateitypen
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Bild-Qualität für JPEG/WEBP
const IMAGE_QUALITY = 80;

export async function POST(req: NextRequest) {
    try {
        // 1. Authentifizierung prüfen
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Nicht authentifiziert" }, { status: 401 });
        }

        // 2. Formular-Daten abrufen
        const formData = await req.formData();
        const file = formData.get("file") as File;

        // 3. Validierung
        if (!file) {
            return NextResponse.json({ message: "Keine Datei hochgeladen" }, { status: 400 });
        }

        // Größenbeschränkung prüfen
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ message: "Datei zu groß (Max. 5MB)" }, { status: 400 });
        }

        // Dateityp prüfen
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json({ message: "Nicht unterstützter Dateityp" }, { status: 400 });
        }

        // 4. Datei in ein ArrayBuffer umwandeln
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 5. Bildoptimierung mit Sharp
        let optimizedBuffer: Buffer;
        let width: number;
        let height: number;

        try {
            const sharpImage = sharp(buffer);
            const metadata = await sharpImage.metadata();

            // Optimiere das Bild (max 1200px Breite, behalte Seitenverhältnis)
            optimizedBuffer = await sharpImage
                .resize({
                    width: Math.min(metadata.width || 1200, 1200),
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: IMAGE_QUALITY })
                .toBuffer();

            // Metadaten des optimierten Bildes abrufen
            const optimizedMetadata = await sharp(optimizedBuffer).metadata();
            width = optimizedMetadata.width || 0;
            height = optimizedMetadata.height || 0;
        } catch (err) {
            console.error("Fehler bei der Bildoptimierung:", err);
            return NextResponse.json({ message: "Fehler bei der Bildverarbeitung" }, { status: 500 });
        }

        // 6. Bild in die Datenbank speichern ohne Komponenten-Beziehung
        const image = await prisma.image.create({
            data: {
                data: optimizedBuffer,
                mimeType: "image/webp",
                width,
                height,
                size: optimizedBuffer.length,
                originalName: file.name,
                // Entferne die componentId-Beziehung, da das Bild erst später einer Komponente zugewiesen wird
                componentId: null, // Setze auf null, wenn du das Prisma-Schema angepasst hast
            },
        });

        // 7. URL für Bildabruf generieren
        const imageUrl = `/api/images/${image.id}`;

        console.log(`Bild erfolgreich in Datenbank gespeichert: ID ${image.id}`);

        // 8. Erfolgsmeldung zurückgeben
        return NextResponse.json({
            url: imageUrl,
            id: image.id,
            size: optimizedBuffer.length,
            type: "image/webp",
            width,
            height,
        });
    } catch (error) {
        console.error("Fehler beim Hochladen:", error);
        return NextResponse.json({ message: "Interner Serverfehler beim Hochladen" }, { status: 500 });
    }
}
