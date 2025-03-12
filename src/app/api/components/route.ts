import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId");
        const limit = parseInt(searchParams.get("limit") || "10");
        const page = parseInt(searchParams.get("page") || "1");
        const skip = (page - 1) * limit;

        const whereClause = categoryId ? { categoryId } : {};

        const [components, total] = await Promise.all([
            prisma.component.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    category: true,
                    images: {
                        take: 1,
                    },
                },
                take: limit,
                skip,
            }),
            prisma.component.count({
                where: whereClause,
            }),
        ]);

        return NextResponse.json({
            components,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Komponenten:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description, categoryId, categoryName, textBlocks, images, userId } = body;

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

        // Komponente erstellen
        const component = await prisma.component.create({
            data: {
                title,
                description,
                userId,
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

        return NextResponse.json(component, { status: 201 });
    } catch (error) {
        console.error("Fehler beim Erstellen der Komponente:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}
