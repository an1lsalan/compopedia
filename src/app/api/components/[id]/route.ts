import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: {
        id: string;
    };
}

export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { id } = params;

        const component = await prisma.component.findUnique({
            where: {
                id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
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

export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = params;
        const body = await request.json();
        const { title, description, categoryId, categoryName, textBlocks, images, userId } = body;

        // Überprüfen, ob die Komponente existiert und dem Benutzer gehört
        const existingComponent = await prisma.component.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!existingComponent) {
            return NextResponse.json({ message: "Komponente nicht gefunden oder keine Berechtigung" }, { status: 404 });
        }

        let finalCategoryId = categoryId;

        // Wenn eine neue Kategorie erstellt werden soll
        if (!categoryId && categoryName) {
            const existingCategory = await prisma.category.findUnique({
                where: {
                    name: categoryName,
                },
            });

            if (existingCategory) {
                finalCategoryId = existingCategory.id;
            } else {
                // Neue Kategorie erstellen
                const newCategory = await prisma.category.create({
                    data: {
                        name: categoryName,
                    },
                });
                finalCategoryId = newCategory.id;
            }
        }

        // Alle bestehenden TextBlocks und Images löschen
        await prisma.textBlock.deleteMany({
            where: {
                componentId: id,
            },
        });

        await prisma.image.deleteMany({
            where: {
                componentId: id,
            },
        });

        // Komponente aktualisieren
        const updatedComponent = await prisma.component.update({
            where: {
                id,
            },
            data: {
                title,
                description,
                categoryId: finalCategoryId,
                textBlocks: {
                    create: textBlocks.map((block: { content: string }) => ({
                        content: block.content,
                    })),
                },
                images: {
                    create: images.map((image: { url: string }) => ({
                        url: image.url,
                    })),
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                category: true,
                textBlocks: true,
                images: true,
            },
        });

        return NextResponse.json(updatedComponent);
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Komponente:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ message: "Benutzer-ID ist erforderlich" }, { status: 400 });
        }

        // Überprüfen, ob die Komponente existiert und dem Benutzer gehört
        const existingComponent = await prisma.component.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!existingComponent) {
            return NextResponse.json({ message: "Komponente nicht gefunden oder keine Berechtigung" }, { status: 404 });
        }

        // Komponente löschen (Cascade Deletion wird durch die Prisma-Schema-Beziehungen gehandhabt)
        await prisma.component.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({ message: "Komponente erfolgreich gelöscht" });
    } catch (error) {
        console.error("Fehler beim Löschen der Komponente:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}
