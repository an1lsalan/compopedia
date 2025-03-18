// src/app/api/images/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Wichtig: Warte auf params in Next.js App Router
        const id = await params.id;

        // Bild aus der Datenbank laden
        const image = await prisma.image.findUnique({
            where: { id },
        });

        // Prüfen, ob das Bild existiert
        if (!image || !image.data) {
            return new NextResponse("Bild nicht gefunden", { status: 404 });
        }

        // MIME-Typ aus der Datenbank verwenden oder Fallback
        const contentType = image.mimeType || "image/webp";

        // Response mit Caching-Headers
        return new NextResponse(image.data, {
            headers: {
                "Content-Type": contentType,
                "Content-Length": String(image.size || image.data.length),
                "Cache-Control": "public, max-age=31536000, immutable", // 1 Jahr cachen, da Bilder IDs unveränderlich sind
                ETag: `"${id}"`,
            },
        });
    } catch (error) {
        console.error("Fehler beim Abrufen des Bildes:", error);
        return new NextResponse("Interner Serverfehler", { status: 500 });
    }
}
