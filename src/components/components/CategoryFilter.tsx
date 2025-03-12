"use client";

import { Category } from "@/types/index";

interface CategoryFilterProps {
    categories: Category[];
    selectedCategory: string | null;
    onChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onChange }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
            <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === null ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => onChange(null)}
            >
                Alle
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        selectedCategory === category.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => onChange(category.id)}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
}
