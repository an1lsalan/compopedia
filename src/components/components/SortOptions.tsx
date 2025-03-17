"use client";

interface SortOptionsProps {
    onSort: (sortOption: string) => void;
    currentSort?: string;
}

export default function SortOptions({ onSort, currentSort = "createdAt:desc" }: SortOptionsProps) {
    return (
        <div className="flex items-center space-x-2">
            <label className="text-sm font-medium mr-2 dark:text-gray-200 whitespace-nowrap">Sortieren nach:</label>
            <select
                value={currentSort}
                onChange={(e) => onSort(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 dark:text-gray-200 text-sm"
            >
                <option value="createdAt:desc">Neueste zuerst</option>
                <option value="createdAt:asc">Älteste zuerst</option>
                <option value="title:asc">Titel (A-Z)</option>
                <option value="title:desc">Titel (Z-A)</option>
            </select>
        </div>
    );
}
