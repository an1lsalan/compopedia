// src/app/api/components/route.ts (angepasst für DB-Bilderspeicherung)
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/components/route.ts (korrigiert für User-ID-Validierung)
// src/app/api/components/route.ts (korrigiert für Image-URL-Verarbeitung)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId");
        const searchQuery = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";
        const limit = parseInt(searchParams.get("limit") || "10");
        const page = parseInt(searchParams.get("page") || "1");
        const skip = (page - 1) * limit;

        // Baue die Where-Klausel auf Basis der Filter
        let whereClause: any = {};

        // Kategorie-Filter
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        // Suchfilter für Titel
        if (searchQuery) {
            whereClause.title = {
                contains: searchQuery,
                mode: "insensitive", // Groß-/Kleinschreibung ignorieren
            };
        }

        const [components, total] = await Promise.all([
            prisma.component.findMany({
                where: whereClause,
                orderBy: {
                    [sortBy as string]: sortOrder,
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
                        select: {
                            id: true,
                            url: true, // Legacy Feld
                            // Neue Felder für DB-basierte Bilder
                            width: true,
                            height: true,
                            mimeType: true,
                            // Explizit data ausschließen, da es zu groß ist
                            data: false,
                        },
                    },
                },
                take: limit,
                skip,
            }),
            prisma.component.count({
                where: whereClause,
            }),
        ]);

        // Komponenten mit angepassten Bild-URLs zurückgeben
        const processedComponents = components.map((component) => {
            const processedImages = component.images.map((image) => {
                // Wenn ein Legacy-URL vorhanden ist, diese verwenden
                if (image.url) {
                    return image;
                }
                // Sonst die neue API-URL für DB-Bilder erstellen
                return {
                    ...image,
                    url: `/api/images/${image.id}`,
                };
            });

            return {
                ...component,
                images: processedImages,
            };
        });

        return NextResponse.json({
            components: processedComponents,
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
        // Authentifizierungsinformationen abrufen
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Nicht authentifiziert" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, categoryId, categoryName, textBlocks, images } = body;

        // Verwende die Session user ID statt der übergebenen
        const userId = session.user.id;

        console.log("Received component data:", body);
        console.log("Images being saved:", images);
        console.log("Using authenticated user ID:", userId);

        // Prüfe, ob der Benutzer existiert
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!userExists) {
            return NextResponse.json({ message: "Benutzer existiert nicht" }, { status: 400 });
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

        // Bereite Bild-Daten vor - robust gegen verschiedene Formate
        const imageConnections = images
            ?.map((image: any) => {
                try {
                    // Protokolliere für Debugging
                    console.log("Processing image:", JSON.stringify(image));

                    // Fall 1: image.url ist ein String und beginnt mit /api/images/
                    if (typeof image.url === "string" && image.url.startsWith("/api/images/")) {
                        const imageId = image.url.split("/").pop();
                        console.log("Case 1: API URL string, extracted ID:", imageId);
                        return { id: imageId };
                    }

                    // Fall 2: image.url ist ein Objekt mit einer id-Eigenschaft
                    else if (image.url && typeof image.url === "object" && image.url.id) {
                        console.log("Case 2: URL is object with ID:", image.url.id);
                        return { id: image.url.id };
                    }

                    // Fall 3: image hat eine id-Eigenschaft
                    else if (image.id) {
                        console.log("Case 3: Image has ID property:", image.id);
                        return { id: image.id };
                    }

                    // Fall 4: image.url ist ein String (Legacy-Fall)
                    else if (typeof image.url === "string") {
                        console.log("Case 4: Legacy URL string:", image.url);
                        return { url: image.url };
                    }

                    // Fallback: Kann keine Verbindung herstellen
                    console.log("No connection could be made for image:", image);
                    return null;
                } catch (err) {
                    console.error("Error processing image:", err);
                    return null;
                }
            })
            .filter(Boolean); // Entferne null-Werte

        console.log("Final image connections:", imageConnections);

        // Komponente erstellen mit angepasster Bilder-Behandlung und validierter user ID
        const component = await prisma.component.create({
            data: {
                title,
                description,
                userId, // Die validierte user ID
                categoryId: finalCategoryId,
                textBlocks: {
                    create:
                        textBlocks?.map((block: { content: string; headline?: string; blockType?: string; language?: string }) => ({
                            content: block.content,
                            headline: block.headline || "",
                            blockType: block.blockType || "code",
                            language: block.language || "javascript",
                        })) || [],
                },
                images: {
                    // Verknüpfe die bestehenden Bilder mit der Komponente
                    connect: imageConnections,
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
                images: {
                    select: {
                        id: true,
                        url: true,
                        width: true,
                        height: true,
                        mimeType: true,
                        data: false,
                    },
                },
            },
        });

        // Komponente mit angepassten Bild-URLs zurückgeben
        const processedComponent = {
            ...component,
            images: component.images.map((image) => {
                // Wenn ein Legacy-URL vorhanden ist, diese verwenden
                if (image.url) {
                    return image;
                }
                // Sonst die neue API-URL für DB-Bilder erstellen
                return {
                    ...image,
                    url: `/api/images/${image.id}`,
                };
            }),
        };

        return NextResponse.json(processedComponent, { status: 201 });
    } catch (error) {
        console.error("Fehler beim Erstellen der Komponente:", error);
        return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
    }
}
