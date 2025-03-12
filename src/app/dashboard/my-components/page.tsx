import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import ComponentsList from "@/components/dashboard/ComponentsList";

export const metadata = {
    title: "Meine Komponenten - Compopedia",
    description: "Verwalte deine hochgeladenen Komponenten",
};

export default async function MyComponentsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Alle Komponenten des Benutzers laden
    const userComponents = await prisma.component.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            category: true,
            images: {
                take: 1,
            },
            user: true,
            textBlocks: true,
        },
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Meine Komponenten</h1>
                    <p className="text-gray-600">Verwalte die von dir hochgeladenen Komponenten</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link href="/upload">
                        <Button>Neue Komponente hochladen</Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {userComponents.length === 0 ? (
                    <div className="text-center py-12">
                        <h2 className="text-xl font-semibold mb-2">Keine Komponenten gefunden</h2>
                        <p className="text-gray-500 mb-6">Du hast noch keine Komponenten hochgeladen</p>
                        <Link href="/upload">
                            <Button>Erste Komponente hochladen</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="p-6">
                        <ComponentsList components={userComponents} />
                    </div>
                )}
            </div>
        </div>
    );
}
