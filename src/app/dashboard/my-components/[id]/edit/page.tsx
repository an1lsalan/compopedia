/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UploadForm from "@/components/upload/UploadForm";

export async function generateMetadata({ params }: any) {
    const component = await prisma.component.findUnique({
        where: {
            id: params.id,
        },
        include: {
            category: true,
            textBlocks: true,
            images: true,
            user: true, // Include the user property
        },
    });

    if (!component) {
        return {
            title: "Komponente nicht gefunden",
        };
    }

    return {
        title: `Bearbeiten: ${component.title} | Compopedia`,
    };
}

export default async function EditComponentPage({ params }: any) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const component = await prisma.component.findUnique({
        where: {
            id: params.id,
            userId: session.user.id, // Sicherstellen, dass die Komponente dem Benutzer gehört
        },
        include: {
            category: true,
            textBlocks: true,
            images: true,
            user: true,
        },
    });

    if (!component) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Komponente bearbeiten</h1>
                <p className="text-gray-600 mb-8 dark:text-gray-300">Aktualisiere deine Komponente</p>
                <div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
                    <UploadForm initialData={component} />
                </div>
            </div>
        </div>
    );
}
