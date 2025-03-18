"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Image as ImageType } from "@/types/index";
import toast from "react-hot-toast";

interface ImageUploadProps {
    onChange: (files: File[], imageData: ImageData[]) => void;
    initialImages?: ImageType[];
    maxFiles?: number;
}

interface ImageData {
    id: string;
    url: string;
    width?: number;
    height?: number;
    type?: string;
    size?: number;
}

// Maximale Dateigröße in Bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Erlaubte Dateitypen
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function ImageUpload({ onChange, initialImages, maxFiles = 10 }: ImageUploadProps) {
    const [previewImages, setPreviewImages] = useState<ImageData[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);

    // Initialisiere Bilder aus initialImages beim ersten Rendern
    useEffect(() => {
        if (initialImages && initialImages.length > 0) {
            const initialPreviewImages = initialImages.map((img) => ({
                id: img.id,
                url: typeof img.url === "string" ? img.url : `/api/images/${img.id}`,
                width: img.width || 0,
                height: img.height || 0,
            }));

            setPreviewImages(initialPreviewImages);

            // Wichtig: Informiere übergeordnete Komponente über die initialisierten Bilder
            onChange([], initialPreviewImages);

            console.log("Initialisierte", initialPreviewImages.length, "Bilder");
        }
    }, [initialImages]);

    // Datei-Validierung
    const validateFile = (file: File): boolean => {
        setError(null);

        // Dateityp prüfen
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            setError(`Nicht unterstützter Dateityp: ${file.type}. Erlaubt sind nur JPG, PNG, GIF und WebP.`);
            return false;
        }

        // Dateigröße prüfen
        if (file.size > MAX_FILE_SIZE) {
            setError(`Datei zu groß: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximale Größe ist 5MB.`);
            return false;
        }

        return true;
    };

    // Dateien hochladen mit Fortschrittsanzeige
    const uploadFiles = useCallback(async (newFiles: File[]) => {
        if (newFiles.length === 0) return [];

        setIsUploading(true);
        setUploadProgress(0);

        const progressStep = 100 / newFiles.length;
        const uploadedImages: ImageData[] = [];

        try {
            for (let i = 0; i < newFiles.length; i++) {
                const file = newFiles[i];

                // Zeige Fortschritt
                setUploadProgress(i * progressStep);

                // Datei hochladen
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Upload fehlgeschlagen");
                }

                const data = await response.json();
                uploadedImages.push({
                    id: data.id,
                    url: data.url,
                    width: data.width,
                    height: data.height,
                    type: data.type,
                    size: data.size,
                });

                // Fortschritt aktualisieren
                setUploadProgress((i + 1) * progressStep);
            }

            setUploadProgress(100);
            return uploadedImages;
        } catch (error) {
            console.error("Fehler beim Hochladen:", error);
            if (error instanceof Error) {
                setError(error.message);
                toast.error(error.message);
            } else {
                setError("Upload fehlgeschlagen");
                toast.error("Upload fehlgeschlagen");
            }
            return [];
        } finally {
            // Kurze Verzögerung, damit der Nutzer den 100% Fortschritt sieht
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);
        }
    }, []);

    // Dateiverarbeitung
    const handleFiles = async (newFileList: FileList | null) => {
        if (!newFileList || newFileList.length === 0) return;
        setError(null);

        // Überprüfen, ob max. Anzahl überschritten wird
        if (previewImages.length + newFileList.length > maxFiles) {
            setError(`Maximal ${maxFiles} Bilder erlaubt`);
            toast.error(`Maximal ${maxFiles} Bilder erlaubt`);
            return;
        }

        // Dateien validieren
        const fileArray = Array.from(newFileList);
        const validFiles = fileArray.filter(validateFile);

        if (validFiles.length === 0) return;

        try {
            // Dateien hochladen
            const uploadedImages = await uploadFiles(validFiles);

            if (uploadedImages.length > 0) {
                // Neue Bilder zu bestehenden hinzufügen
                const newImages = [...previewImages, ...uploadedImages];

                // Aktualisiere den State
                setPreviewImages(newImages);
                setFiles((prev) => [...prev, ...validFiles]);

                // Gib die neuen Werte an die übergeordnete Komponente weiter
                onChange([...files, ...validFiles], newImages);

                toast.success(`${uploadedImages.length} Bilder erfolgreich hochgeladen`);
            }
        } catch (error) {
            console.error("Fehler bei der Verarbeitung:", error);
        }
    };

    // Event-Handler
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
        // Bild aus den Vorschaubildern entfernen
        const newPreviewImages = [...previewImages];
        newPreviewImages.splice(index, 1);
        setPreviewImages(newPreviewImages);

        // Files entsprechend aktualisieren
        const newFiles = [...files];
        if (index < newFiles.length) {
            newFiles.splice(index, 1);
            setFiles(newFiles);
        }

        // onChange mit den aktualisierten Arrays aufrufen
        onChange(newFiles, newPreviewImages);

        console.log("Bild entfernt, noch", newPreviewImages.length, "Bilder übrig");
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : isUploading
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-gray-300 dark:border-gray-600"
                } dark:bg-gray-800 transition-colors duration-200`}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleChange}
                    className="hidden"
                    disabled={isUploading}
                />

                <div className="space-y-2">
                    {isUploading ? (
                        <div className="space-y-3">
                            <div className="flex justify-center">
                                <svg
                                    className="animate-spin h-8 w-8 text-blue-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Lade Bilder hoch... {uploadProgress.toFixed(0)}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 text-gray-400 dark:text-gray-500"
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ziehe Bilder hierher oder klicke, um Bilder auszuwählen</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Unterstützte Formate: JPG, PNG, GIF, WebP (max. 5MB)</p>
                        </>
                    )}

                    <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()} disabled={isUploading}>
                        Bilder auswählen
                    </Button>
                </div>
            </div>

            {previewImages.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium dark:text-gray-200">
                            Hochgeladene Bilder ({previewImages.length}/{maxFiles})
                        </h3>
                        {previewImages.length > 1 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 dark:text-red-400 hover:text-red-800 hover:bg-red-50"
                                onClick={() => {
                                    if (confirm("Möchtest du wirklich alle Bilder entfernen?")) {
                                        setPreviewImages([]);
                                        setFiles([]);
                                        onChange([], []);
                                    }
                                }}
                            >
                                Alle entfernen
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {previewImages.map((image, index) => (
                            <div
                                key={image.id || index}
                                className="relative group border rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800"
                            >
                                <Image
                                    src={image.url}
                                    alt={`Vorschau ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1 rounded-full transition-opacity"
                                        aria-label="Bild entfernen"
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
                </div>
            )}
        </div>
    );
}
