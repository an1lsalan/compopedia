"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Component } from "@/types/index";
import Prism from "prismjs";

// PrismJS-Sprachen importieren
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-powershell";

interface ComponentDetailProps {
    component: Component;
}

export default function ComponentDetail({ component }: ComponentDetailProps) {
    const { data: session } = useSession();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    // Prism.js kann nur auf dem Client ausgeführt werden
    useEffect(() => {
        setIsMounted(true);
        Prism.highlightAll();
    }, []);

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === component.images.length - 1 ? 0 : prevIndex + 1));
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? component.images.length - 1 : prevIndex - 1));
    };

    const isOwner = session?.user?.id === component.userId;

    // Bestimme die entsprechende CSS-Klasse für Terminal-Blöcke
    const getTerminalClass = (language: string) => {
        switch (language) {
            case "powershell":
                return "language-powershell";
            case "cmd":
                return "language-batch";
            case "docker":
            case "git":
            case "npm":
            case "bash":
            default:
                return "language-bash";
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold dark:text-white">{component.title}</h1>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                        {component.category.name}
                    </span>
                </div>

                <div className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    <p>
                        Erstellt von {component.user.name} am {formatDateTime(component.createdAt)}
                    </p>
                    {component.createdAt.toString() !== component.updatedAt.toString() && (
                        <p>Aktualisiert am {formatDateTime(component.updatedAt)}</p>
                    )}
                </div>

                {component.images.length > 0 && (
                    <div className="mb-8 relative">
                        <div className="h-96 relative rounded-lg overflow-hidden">
                            <Image
                                src={component.images[currentImageIndex].url}
                                alt={`Bild ${currentImageIndex + 1} von ${component.title}`}
                                fill
                                className="object-contain"
                            />
                        </div>
                        {component.images.length > 1 && (
                            <div className="absolute inset-0 flex items-center justify-between">
                                <button
                                    onClick={prevImage}
                                    className="bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 p-2 rounded-full shadow mx-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 p-2 rounded-full shadow mx-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {component.images.length > 1 && (
                            <div className="flex justify-center mt-2 space-x-2">
                                {component.images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-3 h-3 rounded-full ${
                                            index === currentImageIndex ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="prose max-w-none mb-8 dark:prose-invert">
                    <h2 className="text-xl font-semibold mb-2 dark:text-white">Beschreibung</h2>
                    <p className="whitespace-pre-line dark:text-gray-300">{component.description}</p>
                </div>

                {component.textBlocks.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Code & Terminal Blöcke</h2>
                        {component.textBlocks.map((block, index) => (
                            <div
                                key={block.id}
                                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-medium dark:text-gray-200">{block.headline || `Block ${index + 1}`}</h3>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                        {block.blockType === "terminal" ? (block.language === "bash" ? "Shell" : block.language) : block.language}
                                    </span>
                                </div>

                                {isMounted && (
                                    <pre
                                        className={`bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto ${
                                            block.blockType === "terminal" ? "terminal-code" : ""
                                        }`}
                                    >
                                        <code
                                            className={
                                                block.blockType === "terminal" ? getTerminalClass(block.language) : `language-${block.language}`
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: Prism.highlight(
                                                    block.content,
                                                    block.blockType === "terminal"
                                                        ? Prism.languages[block.language] || Prism.languages.bash
                                                        : Prism.languages[block.language] || Prism.languages.javascript,
                                                    block.blockType === "terminal" ? block.language : block.language
                                                ),
                                            }}
                                        />
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {isOwner && (
                    <div className="flex space-x-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Link href={`/dashboard/my-components/${component.id}/edit`}>
                            <Button variant="primary">Bearbeiten</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
