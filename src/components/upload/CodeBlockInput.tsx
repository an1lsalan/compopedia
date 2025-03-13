/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/upload/CodeBlockInput.tsx
"use client";

import { useState } from "react";
import { UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";

interface CodeBlockInputProps {
    index: number;
    register: UseFormRegister<any>;
    remove: (index: number) => void;
    error?: string;
    value: string;
    onChange: (value: string) => void;
}

const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "jsx", label: "React JSX" },
    { value: "tsx", label: "React TSX" },
    { value: "css", label: "CSS" },
    { value: "scss", label: "SCSS" },
    { value: "php", label: "PHP" },
    { value: "markup", label: "HTML" },
    { value: "plaintext", label: "Plain Text" },
];

export default function CodeBlockInput({ index, register, remove, error, value, onChange }: CodeBlockInputProps) {
    const [language, setLanguage] = useState("javascript");

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <h3 className="text-sm font-medium dark:text-gray-200">Block {index + 1}</h3>

                <div className="flex items-center gap-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-2 py-1 dark:text-gray-200"
                    >
                        {languageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {index > 0 && (
                        <Button
                            type="button"
                            onClick={() => remove(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        >
                            Entfernen
                        </Button>
                    )}
                </div>
            </div>

            <textarea
                {...register(`textBlocks.${index}.content`)}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full min-h-[150px] border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm dark:bg-gray-700 dark:text-gray-200 ${
                    error ? "border-red-500 dark:border-red-700" : ""
                }`}
                placeholder="// Dein Code hier..."
            />

            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}

            {/* Hinzufügen eines Felds, um die Sprache zu speichern */}
            <input type="hidden" {...register(`textBlocks.${index}.language`)} value={language} />
        </div>
    );
}
