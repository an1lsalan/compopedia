// src/app/api/images/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest,   { params }: { params: Promise<{ id: string }> }) {
    try {
        // Extract the id from the URL
        
        //const { searchParams } = new URL(request.url);
        //const id = searchParams.get("id");
        //console.log("id", id);
        let { id } = await params;

        // Bild aus der Datenbank laden
        const image = await prisma.image.findUnique({
            where: {
                id: id || undefined,
            },
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
