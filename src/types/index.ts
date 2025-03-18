// src/types/index.ts
// Aktualisiert für Datenbank-basierte Bildspeicherung

export type Component = {
    id: string;
    title: string;
    description: string;
    userId: string;
    user: User;
    categoryId: string;
    category: Category;
    textBlocks: TextBlock[];
    images: Image[];
    createdAt: Date;
    updatedAt: Date;
};

export type ComponentFormData = {
    title: string;
    description: string;
    categoryId: string;
    categoryName?: string; // Für das Erstellen einer neuen Kategorie
    textBlocks: { content: string }[];
    images: File[];
};

export type User = {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    components?: Component[];
};

export type LoginFormData = {
    email: string;
    password: string;
};

export type RegisterFormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export type Category = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    components?: Component[];
};

export type TextBlock = {
    id: string;
    content: string;
    componentId: string;
    blockType: string;
    headline: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
};

// Erweiterter Image-Typ für DB-Speicherung
export type Image = {
    id: string;
    url?: string; // Legacy-Feld für Dateisystem-URLs
    componentId: string;
    createdAt: Date;
    updatedAt: Date;

    // Neue Felder für DB-basierte Speicherung
    data?: Uint8Array; // Binärdaten des Bildes (nicht in JSON-Antworten enthalten)
    mimeType?: string; // Typ des Bildes (image/webp, etc.)
    width?: number; // Breite in Pixeln
    height?: number; // Höhe in Pixeln
    size?: number; // Größe in Bytes
    originalName?: string; // Ursprünglicher Dateiname
};

export type UpdateUserData = {
    name: string;
    email: string;
    password?: string; // Optional, da es nur unter bestimmten Bedingungen gesetzt wird
};
