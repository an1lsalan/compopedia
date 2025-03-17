"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Component } from "@/types/index";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Für die Lightbox benötigen wir ein Array mit src-Eigenschaften
    const lightboxImages = component.images.map((img) => ({
        src: img.url,
        alt: `Bild von ${component.title}`,
    }));

    const getPrismLanguage = (language: string): string => {
        const languageMap: Record<string, string> = {
            html: "markup",
            css: "css",
            js: "javascript",
            ts: "typescript",
            jsx: "jsx",
            tsx: "tsx",
            java: "java",
            py: "python",
            cs: "csharp",
            go: "go",
            rs: "rust",
            sql: "sql",
            json: "json",
            yaml: "yaml",
            md: "markdown",
            bash: "bash",
            ps: "powershell",
            cmd: "cmd",
            docker: "docker",
            git: "git",
            npm: "npm",
        };

        return languageMap[language] || language;
    };

    // Prism.js kann nur auf dem Client ausgeführt werden
    useEffect(() => {
        setIsMounted(true);
        Prism.highlightAll();
    }, []);

    // const nextImage = () => {
    //     setCurrentImageIndex((prevIndex) => (prevIndex === component.images.length - 1 ? 0 : prevIndex + 1));
    // };

    // const prevImage = () => {
    //     setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? component.images.length - 1 : prevIndex - 1));
    // };

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
                    <div className="mb-8">
                        {/* Swiper Slider */}
                        <div className="rounded-lg overflow-hidden mb-4 cursor-pointer" onClick={() => setLightboxOpen(true)}>
                            <Swiper
                                modules={[Navigation, Pagination, A11y, Keyboard]}
                                spaceBetween={0}
                                slidesPerView={1}
                                navigation
                                pagination={{ clickable: true }}
                                keyboard={{ enabled: true }}
                                onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
                                className="h-96 w-full bg-gray-100 dark:bg-gray-700"
                            >
                                {component.images.map((image, index) => (
                                    <SwiperSlide key={image.id} className="relative h-full">
                                        <div className="relative h-full w-full">
                                            <Image src={image.url} alt={`Bild ${index + 1} von ${component.title}`} fill className="object-contain" />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Hinweis zum Vergrößern */}
                        {component.images.length > 0 && (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">Klicke auf ein Bild, um es zu vergrößern</p>
                        )}

                        {/* Lightbox für Vollbildansicht */}
                        <Lightbox
                            open={lightboxOpen}
                            close={() => setLightboxOpen(false)}
                            slides={lightboxImages}
                            plugins={[Thumbnails, Zoom]}
                            index={currentImageIndex}
                        />
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
                                                block.blockType === "terminal"
                                                    ? getTerminalClass(block.language)
                                                    : `language-${getPrismLanguage(block.language)}`
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: Prism.highlight(
                                                    block.content,
                                                    block.blockType === "terminal"
                                                        ? Prism.languages[block.language] || Prism.languages.bash
                                                        : Prism.languages[getPrismLanguage(block.language)] || Prism.languages.javascript,
                                                    block.blockType === "terminal" ? block.language : getPrismLanguage(block.language)
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
