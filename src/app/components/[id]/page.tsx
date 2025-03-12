import { notFound } from "next/navigation";
import ComponentDetail from "@/components/components/ComponentDetail";
import { prisma } from "@/lib/prisma";

interface ComponentPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: ComponentPageProps) {
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

export default async function ComponentPage({ params }: ComponentPageProps) {
    const component = await prisma.component.findUnique({
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

    if (!component) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ComponentDetail component={component} />
        </div>
    );
}
