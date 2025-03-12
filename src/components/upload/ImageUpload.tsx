"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Image as ImageType } from "@/types/index";

interface ImageUploadProps {
    onChange: (files: File[], urls: string[]) => void;
    initialImages?: ImageType[];
}

export default function ImageUpload({ onChange, initialImages }: ImageUploadProps) {
    const [previewUrls, setPreviewUrls] = useState<string[]>(initialImages ? initialImages.map((img) => img.url) : []);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);

    // In der handleFiles-Funktion in ImageUpload.tsx
    const handleFiles = async (newFiles: FileList | null) => {
        if (!newFiles || newFiles.length === 0) return;

        const fileArray = Array.from(newFiles);

        try {
            // Dateien hochladen und persistente URLs erhalten
            const uploadedUrls = await Promise.all(
                fileArray.map(async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);

                    const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error("Upload fehlgeschlagen");
                    }

                    const data = await response.json();
                    return data.url; // Diese URL ist persistent
                })
            );

            console.log("Hochgeladene URLs:", uploadedUrls);

            // WICHTIG: Hier fügen wir die neuen URLs zum bestehenden Array hinzu
            const newPreviewUrls = [...previewUrls, ...uploadedUrls];

            // Aktualisiere den State
            setPreviewUrls(newPreviewUrls);
            setFiles((prev) => [...prev, ...fileArray]);

            // Gib die NEUEN Werte an die übergeordnete Komponente weiter
            onChange([...files, ...fileArray], newPreviewUrls);

            console.log("Neue PreviewUrls:", newPreviewUrls);
        } catch (error) {
            console.error("Fehler beim Hochladen:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        handleFiles(e.target.files);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeImage = (index: number) => {
        // Files aktualisieren
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);

        // Preview-URLs aktualisieren
        const newPreviewUrls = [...previewUrls];
        newPreviewUrls.splice(index, 1);
        setPreviewUrls(newPreviewUrls);

        // onChange mit den aktualisierten Arrays aufrufen
        onChange(newFiles, newPreviewUrls);

        console.log("Nach Entfernen - URLs:", newPreviewUrls);
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
            >
                <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleChange} className="hidden" />

                <div className="space-y-2">
                    <div className="flex justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400"
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
                    <p className="text-sm text-gray-500">Ziehe Bilder hierher oder klicke, um Bilder auszuwählen</p>
                </div>

                <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>
                    Bilder auswählen
                </Button>
            </div>

            {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative group border rounded-lg overflow-hidden aspect-square">
                            <Image src={url} alt={`Vorschau ${index + 1}`} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1 rounded-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
