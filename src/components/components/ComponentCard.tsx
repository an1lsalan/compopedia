/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDate, truncateText } from "@/lib/utils";
import { Component } from "@/types/index";
import { motion } from "framer-motion";

interface ComponentCardProps {
    component: Component;
}

export default function ComponentCard({ component }: ComponentCardProps) {
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
        return "/uploads/placeholder.webp";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
            <Link href={`/components/${component.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg dark:bg-gray-800">
                    <div className="h-48 relative bg-gray-100 dark:bg-gray-700">
                        {component.images && component.images.length > 0 ? (
                            <Image src={getImageUrl(component.images[0])} alt={component.title} fill className="object-cover" />
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <span className="text-gray-400 dark:text-gray-600">Kein Bild verfügbar</span>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                                {component.category?.name || "Keine Kategorie"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(component.createdAt)}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">{component.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 dark:text-gray-300">{truncateText(component.description, 120)}</p>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>Von {component.user?.name || "Unbekannt"}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
