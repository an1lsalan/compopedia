/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UploadForm from "@/components/upload/UploadForm";
import { Component, Image, User, Category, TextBlock } from "@/types/index";

export async function generateMetadata({ params }: any) {
    const dbComponent = await prisma.component.findUnique({
        where: {
            id: params.id,
        },
        include: {
            category: true,
            textBlocks: true,
            images: true,
            user: true,
        },
    });

    if (!dbComponent) {
        return {
            title: "Komponente nicht gefunden",
        };
    }

    return {
        title: `Bearbeiten: ${dbComponent.title} | Compopedia`,
    };
}

export default async function EditComponentPage({ params }: any) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const dbComponent = await prisma.component.findUnique({
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

    if (!dbComponent) {
        notFound();
    }

    // Konvertieren des Prisma-Modells in den Frontend-Typ
    const component: Component = {
        id: dbComponent.id,
        title: dbComponent.title,
        description: dbComponent.description,
        userId: dbComponent.userId,
        categoryId: dbComponent.categoryId,
        createdAt: dbComponent.createdAt,
        updatedAt: dbComponent.updatedAt,
        category: dbComponent.category as Category,
        user: {
            id: dbComponent.user.id,
            name: dbComponent.user.name,
            email: dbComponent.user.email,
            createdAt: dbComponent.user.createdAt,
            updatedAt: dbComponent.user.updatedAt,
        } as User,
        textBlocks: dbComponent.textBlocks.map((block) => ({
            id: block.id,
            content: block.content,
            componentId: block.componentId,
            blockType: block.blockType,
            headline: block.headline,
            language: block.language,
            createdAt: block.createdAt,
            updatedAt: block.updatedAt,
        })) as TextBlock[],
        images: dbComponent.images.map((img) => ({
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
    };

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
