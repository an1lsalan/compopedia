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

        const existingComponent = await prisma.component.findFirst({
            where: { id, userId },
        });

        if (!existingComponent) {
            return NextResponse.json({ message: "Komponente nicht gefunden oder keine Berechtigung" }, { status: 404 });
        }

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

        await prisma.textBlock.deleteMany({ where: { componentId: id } });
        await prisma.image.deleteMany({ where: { componentId: id } });

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
                images: {
                    create: images.map((image: { url: string }) => ({
                        url: image.url,
                    })),
                },
            },
            include: {
                user: { select: { id: true, name: true } },
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
