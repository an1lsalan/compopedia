import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import ComponentsList from "@/components/dashboard/ComponentsList";
import { Component, Image, User, Category, TextBlock } from "@/types/index";

export const metadata = {
    title: "Dashboard - Compopedia",
    description: "Verwalte deine Komponenten und Einstellungen",
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Neuste Komponenten des Benutzers laden
    const dbComponents = await prisma.component.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
        include: {
            category: true,
            images: {
                take: 1,
            },
            user: true,
            textBlocks: true,
        },
    });

    // Gesamtzahl der Komponenten des Benutzers
    const totalComponents = await prisma.component.count({
        where: {
            userId: session.user.id,
        },
    });

    // Konvertieren der Prisma-Modelle in Frontend-Typen
    const userComponents: Component[] = dbComponents.map((comp) => ({
        id: comp.id,
        title: comp.title,
        description: comp.description,
        userId: comp.userId,
        categoryId: comp.categoryId,
        createdAt: comp.createdAt,
        updatedAt: comp.updatedAt,
        category: comp.category as Category,
        user: {
            id: comp.user.id,
            name: comp.user.name,
            email: comp.user.email,
            createdAt: comp.user.createdAt,
            updatedAt: comp.user.updatedAt,
        } as User,
        textBlocks: comp.textBlocks.map((block) => ({
            id: block.id,
            content: block.content,
            componentId: block.componentId,
            blockType: block.blockType,
            headline: block.headline,
            language: block.language,
            createdAt: block.createdAt,
            updatedAt: block.updatedAt,
        })) as TextBlock[],
        images: comp.images.map((img) => ({
            id: img.id,
            url: img.url || undefined, // Konvertiere null zu undefined
            componentId: img.componentId || "",
            createdAt: img.createdAt,
            updatedAt: img.updatedAt,
            data: img.data,
            mimeType: img.mimeType || undefined,
            width: img.width || undefined,
            height: img.height || undefined,
            size: img.size || undefined,
            originalName: img.originalName || undefined,
        })) as Image[],
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-600">Willkommen zurück, {session.user.name}</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link href="/upload">
                        <Button>Neue Komponente hochladen</Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
                    <h2 className="text-lg font-semibold mb-2 dark:text-gray-200">Meine Komponenten</h2>
                    <p className="text-3xl font-bold">{totalComponents}</p>
                    <div className="mt-4">
                        <Link href="/dashboard/my-components">
                            <Button variant="outline" size="sm">
                                Alle anzeigen
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
                    <h2 className="text-lg font-semibold mb-2 dark:text-gray-200">Konto</h2>
                    <p className="text-gray-600 dark:text-gray-200">{session.user.email}</p>
                    <div className="mt-4">
                        <Link href="/dashboard/account">
                            <Button variant="outline" size="sm">
                                Details anzeigen
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Neueste Komponenten</h2>
                    <Link href="/dashboard/my-components">
                        <Button variant="ghost" size="sm">
                            Alle anzeigen
                        </Button>
                    </Link>
                </div>

                {userComponents.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Du hast noch keine Komponenten hochgeladen</p>
                        <Link href="/upload">
                            <Button>Erste Komponente hochladen</Button>
                        </Link>
                    </div>
                ) : (
                    <ComponentsList components={userComponents} />
                )}
            </div>
        </div>
    );
}
