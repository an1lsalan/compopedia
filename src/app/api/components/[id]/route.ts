/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // try {
    //     const { id } = params;

    //     const component = await prisma.component.findUnique({
    //         where: { id },
    //         include: {
    //             user: { select: { id: true, name: true } },
    //             category: true,
    //             textBlocks: true,
    //             images: true,
    //         },
    //     });

    //     if (!component) {
    //         return NextResponse.json({ message: "Komponente nicht gefunden" }, { status: 404 });
    //     }

    //     return NextResponse.json(component);
    // } catch (error) {
    //     console.error("Fehler beim Abrufen der Komponente:", error);
    //     return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    // }
    try {
        const { id } = await params;

        const component = await prisma.component.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true } },
                category: true,
                textBlocks: true,
                images: true,
            },
        });

        if (!component) {
            return NextResponse.json({ message: "Komponente nicht gefunden" }, { status: 404 });
        }

        return NextResponse.json(component);
    } catch (error) {
        console.error("Fehler beim Abrufen der Komponente:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, categoryId, categoryName, textBlocks, images, userId } = body;

        // Debug-Ausgaben
        console.log("Update für Komponente:", id);
        console.log("Empfangene Bilder:", JSON.stringify(images));

        // Überprüfen, ob die Komponente existiert und dem Benutzer gehört
        const existingComponent = await prisma.component.findFirst({
            where: { id, userId },
            include: {
                images: true,
            },
        });

        if (!existingComponent) {
            return NextResponse.json({ message: "Komponente nicht gefunden oder keine Berechtigung" }, { status: 404 });
        }

        console.log("Bestehende Bilder:", JSON.stringify(existingComponent.images));

        // Kategorie-ID bestimmen
        let finalCategoryId = categoryId;
        if (!categoryId && categoryName) {
            const existingCategory = await prisma.category.findUnique({
                where: { name: categoryName },
            });

            if (existingCategory) {
                finalCategoryId = existingCategory.id;
            } else {
                const newCategory = await prisma.category.create({
                    data: { name: categoryName },
                });
                finalCategoryId = newCategory.id;
            }
        }

        // Bestehende TextBlocks löschen
        await prisma.textBlock.deleteMany({ where: { componentId: id } });

        // IDs der zu behaltenden Bilder sammeln
        const imageIds = [];
        for (const image of images) {
            if (image.id) {
                imageIds.push(image.id);
            } else if (image.url && typeof image.url === "object" && image.url.id) {
                imageIds.push(image.url.id);
            }
        }

        console.log("Zu behaltende Bild-IDs:", imageIds);

        // Komponente aktualisieren mit Erhalt der Bilder
        const updatedComponent = await prisma.component.update({
            where: { id },
            data: {
                title,
                description,
                categoryId: finalCategoryId,
                textBlocks: {
                    create: textBlocks.map((block: { content: string; headline?: string; blockType?: string; language?: string }) => ({
                        content: block.content,
                        headline: block.headline || "",
                        blockType: block.blockType || "code",
                        language: block.language || "javascript",
                    })),
                },
                // Wichtig: Wir trennen nur Bilder, die nicht in der Liste sind
                images: {
                    set: imageIds.map((imgId) => ({ id: imgId })),
                },
            },
            include: {
                user: { select: { id: true, name: true } },
                category: true,
                textBlocks: true,
                images: true,
            },
        });

        console.log("Aktualisierte Komponente mit Bildern:", updatedComponent.images.length);

        // Antwort zurückgeben
        return NextResponse.json(updatedComponent);
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Komponente:", error);
        return NextResponse.json({ message: "Interner Serverfehler", error: String(error) }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        console.log(`Löschversuch für Komponente ${id} von Benutzer ${userId}`);

        if (!userId) {
            console.error("DELETE-Anfrage ohne userId");
            return NextResponse.json({ message: "Benutzer-ID ist erforderlich" }, { status: 400 });
        }

        // Überprüfe zuerst, ob die Komponente existiert und dem Benutzer gehört
        const existingComponent = await prisma.component.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                images: true,
            },
        });

        if (!existingComponent) {
            console.error(`Komponente ${id} nicht gefunden oder gehört nicht Benutzer ${userId}`);
            return NextResponse.json({ message: "Komponente nicht gefunden oder keine Berechtigung" }, { status: 404 });
        }

        console.log(`Komponente ${id} gefunden, gehört Benutzer ${userId}`);

        // Lösche die Bilder-Verknüpfungen (nicht die Bilder selbst)
        await prisma.component.update({
            where: { id },
            data: {
                images: {
                    set: [],
                },
            },
        });

        // Lösche die TextBlocks
        await prisma.textBlock.deleteMany({
            where: { componentId: id },
        });

        // Jetzt lösche die Komponente
        await prisma.component.delete({
            where: { id },
        });

        console.log(`Komponente ${id} erfolgreich gelöscht`);

        return NextResponse.json({ message: "Komponente erfolgreich gelöscht" });
    } catch (error) {
        console.error("Fehler beim Löschen der Komponente:", error);
        return NextResponse.json(
            {
                message: "Interner Serverfehler",
                error: String(error),
            },
            { status: 500 }
        );
    }
}
