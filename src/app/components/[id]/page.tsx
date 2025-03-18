import { notFound } from "next/navigation";
import ComponentDetail from "@/components/components/ComponentDetail";
import { prisma } from "@/lib/prisma";
import { Component, Image, TextBlock, User, Category } from "@/types/index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateMetadata({ params }: any) {
    const component = await prisma.component.findUnique({
        where: {
            id: params.id,
        },
        include: {
            category: true,
        },
    });

    if (!component) {
        return {
            title: "Komponente nicht gefunden",
        };
    }

    return {
        title: `${component.title} | Compopedia`,
        description: component.description.substring(0, 160),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ComponentPage({ params }: any) {
    const dbComponent = await prisma.component.findUnique({
        where: {
            id: params.id,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            category: true,
            textBlocks: true,
            images: true,
        },
    });

    if (!dbComponent) {
        notFound();
    }

    // Transformiere das Prisma-Modell in das erwartete Component-Typ Format
    const component: Component = {
        id: dbComponent.id,
        title: dbComponent.title,
        description: dbComponent.description,
        userId: dbComponent.userId,
        categoryId: dbComponent.categoryId,
        createdAt: dbComponent.createdAt,
        updatedAt: dbComponent.updatedAt,
        user: dbComponent.user as User,
        category: dbComponent.category as Category,
        textBlocks: dbComponent.textBlocks as TextBlock[],
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
            <ComponentDetail component={component} />
        </div>
    );
}
