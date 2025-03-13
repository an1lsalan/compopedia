// src/components/components/SortOptions.tsx
"use client";

interface SortOptionsProps {
    onSort: (sortOption: string) => void;
}

export default function SortOptions({ onSort }: SortOptionsProps) {
    return (
        <div className="mb-4">
            <label className="text-sm font-medium mr-2 dark:text-gray-200">Sortieren nach:</label>
            <select
                onChange={(e) => onSort(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 dark:text-gray-200"
            >
                <option value="createdAt:desc">Neueste zuerst</option>
                <option value="createdAt:asc">Älteste zuerst</option>
                <option value="title:asc">Titel (A-Z)</option>
                <option value="title:desc">Titel (Z-A)</option>
            </select>
        </div>
    );
}
