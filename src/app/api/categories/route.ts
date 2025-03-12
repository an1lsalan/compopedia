import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Fehler beim Abrufen der Kategorien:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}
