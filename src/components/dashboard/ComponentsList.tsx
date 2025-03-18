/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Component } from "@/types/index";
import { Button } from "../ui/button";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface ComponentsListProps {
    components: Component[];
}

export default function ComponentsList({ components }: ComponentsListProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!session?.user?.id) return;

        if (!confirm("Bist du sicher, dass du diese Komponente löschen möchtest?")) {
            return;
        }

        setIsDeleting(id);
        setError(null);

        try {
            await axios.delete(`/api/components/${id}?userId=${session.user.id}`);
            router.refresh();
        } catch (error) {
            console.error("Fehler beim Löschen der Komponente:", error);
            setError("Die Komponente konnte nicht gelöscht werden");
        } finally {
            setIsDeleting(null);
        }
    };

    // Hilfsfunktion, um die korrekte Bild-URL zu ermitteln
    const getImageUrl = (image: any): string => {
        // Fall 1: URL ist ein String und beginnt mit /api/images/
        if (typeof image.url === "string" && image.url.startsWith("/api/images/")) {
            return image.url;
        }
        // Fall 2: URL ist ein Objekt mit ID
        else if (image.url && typeof image.url === "object" && image.url.id) {
            return `/api/images/${image.url.id}`;
        }
        // Fall 3: Legacy URL (direkter Pfad)
        else if (typeof image.url === "string") {
            return image.url;
        }
        // Fall 4: Bild hat eine ID, aber keine URL
        else if (image.id) {
            return `/api/images/${image.id}`;
        }
        // Fallback für unbekannte Formate
        return "/placeholder.webp";
    };

    return (
        <div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:text-red-200">{error}</div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                            >
                                Komponente
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider  dark:text-gray-300"
                            >
                                Kategorie
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider  dark:text-gray-300"
                            >
                                Datum
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider  dark:text-gray-300"
                            >
                                Aktionen
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {components.map((component) => (
                            <tr key={component.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 mr-3 relative bg-gray-100 rounded dark:bg-gray-800">
                                            {component.images && component.images.length > 0 ? (
                                                <Image
                                                    src={getImageUrl(component.images[0])}
                                                    alt={component.title}
                                                    fill
                                                    className="object-cover rounded"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-gray-400 dark:text-gray-600">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                <Link href={`/components/${component.id}`}>{component.title}</Link>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {component.category?.name || "Keine Kategorie"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(component.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-4 items-center">
                                        <Link
                                            href={`/dashboard/my-components/${component.id}/edit`}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            Bearbeiten
                                        </Link>
                                        <Button
                                            onClick={() => handleDelete(component.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            disabled={isDeleting === component.id}
                                        >
                                            {isDeleting === component.id ? "Löschen..." : "Löschen"}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
