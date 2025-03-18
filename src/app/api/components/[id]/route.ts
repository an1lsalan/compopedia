/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";

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

        // Überprüfen, ob die Komponente existiert und dem Benutzer gehört
        const existingComponent = await prisma.component.findFirst({
            where: { id, userId },
        });

        if (!existingComponent) {
            return NextResponse.json({ message: "Komponente nicht gefunden oder keine Berechtigung" }, { status: 404 });
        }

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

        // Vorhandene Bilder-Beziehungen entfernen, ohne die Bilder zu löschen
        await prisma.component.update({
            where: { id },
            data: {
                images: {
                    set: [], // Bestehende Beziehungen entfernen, ohne die Bilder zu löschen
                },
            },
        });

        // Hilfsfunktion zum Debuggen der Bilder
        const debugImages = (imageData: any[]) => {
            console.log("Anzahl der Bilder:", imageData.length);

            imageData.forEach((img, index) => {
                console.log(`Bild ${index + 1}:`, JSON.stringify(img));

                if (img.id) {
                    console.log(`- Hat ID: ${img.id}`);
                }

                if (img.url) {
                    if (typeof img.url === "string") {
                        console.log(`- Hat URL als String: ${img.url}`);
                    } else if (typeof img.url === "object") {
                        console.log(`- Hat URL als Objekt:`, JSON.stringify(img.url));
                        if (img.url.id) {
                            console.log(`  - URL-Objekt hat ID: ${img.url.id}`);
                        }
                    }
                }
            });
        };
        // Debug-Logs hinzufügen
        console.log("Bild-Daten vor der Verarbeitung:", JSON.stringify(images));
        debugImages(images);

        // Komponente aktualisieren
        const updatedComponent = await prisma.component.update({
            where: { id },
            data: {
                title,
                description,
                categoryId: finalCategoryId,
                textBlocks: {
                    deleteMany: {}, // Alle bestehenden TextBlocks löschen
                    create: textBlocks.map((block: { content: string; headline?: string; blockType?: string; language?: string }) => ({
                        content: block.content,
                        headline: block.headline || "",
                        blockType: block.blockType || "code",
                        language: block.language || "javascript",
                    })),
                },
                images: {
                    connect: images
                        .map((image: { id: any; url: { id: any } }) => {
                            // Bild-ID extrahieren - entweder direkt oder aus dem URL-Objekt
                            let imageId = null;

                            if (image.id) {
                                imageId = image.id;
                            } else if (image.url && typeof image.url === "object" && image.url.id) {
                                imageId = image.url.id;
                            }

                            if (imageId) {
                                console.log(`Verbinde Bild mit ID: ${imageId}`);
                                return { id: imageId };
                            } else {
                                console.warn("Ungültiges Bild-Format:", image);
                                return null;
                            }
                        })
                        .filter(Boolean), // Null-Werte entfernen
                },
            },
            include: {
                user: { select: { id: true, name: true } },
                category: true,
                textBlocks: true,
                images: true,
            },
        });

        // Antwort zurückgeben
        return NextResponse.json(updatedComponent);
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Komponente:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        const images = await prisma.image.findMany({
            where: { componentId: id },
        });

        if (!userId) {
            return NextResponse.json({ message: "Benutzer-ID ist erforderlich" }, { status: 400 });
        }

        await prisma.component.delete({
            where: { id },
        });

        for (const image of images) {
            if (image.url && image.url.startsWith("/uploads/")) {
                const fileName = image.url ? image.url.split("/").pop() : null;
                if (!fileName) {
                    console.error("Fehler: Dateiname ist undefiniert");
                    continue;
                }
                const filePath = path.join(process.cwd(), "public", "uploads", fileName);
                try {
                    await fs.unlink(filePath);
                    console.log(`Bild gelöscht: ${filePath}`);
                } catch (err) {
                    console.error(`Fehler beim Löschen des Bildes ${filePath}:`, err);
                }
            }
        }

        const existingComponent = await prisma.component.findFirst({
            where: { id, userId },
        });

        if (!existingComponent) {
            return NextResponse.json({ message: "Komponente nicht gefunden oder keine Berechtigung" }, { status: 404 });
        }

        await prisma.component.delete({ where: { id } });

        return NextResponse.json({ message: "Komponente erfolgreich gelöscht" });
    } catch (error) {
        console.error("Fehler beim Löschen der Komponente:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}
