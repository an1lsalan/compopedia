import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
};

export async function uploadImage(file: File) {
    // In a real application, this would upload to a storage service
    // For this example, we'll simulate a successful upload with a delay
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            // Return a fake URL for the uploaded image
            const fakeUrl = URL.createObjectURL(file);
            resolve(fakeUrl);
        }, 1000);
    });
}
