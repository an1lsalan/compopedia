/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CodeBlockInputProps {
    index: number;
    register: UseFormRegister<any>;
    remove: (index: number) => void;
    error?: string;
    value: string;
    onChange: (value: string) => void;
    headlineValue?: string;
    onHeadlineChange?: (value: string) => void;
    blockTypeValue?: string;
    onBlockTypeChange?: (value: string) => void;
    languageValue?: string;
    onLanguageChange?: (value: string) => void;
}

// Code-Sprachen-Optionen
const codeLanguageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "jsx", label: "React JSX" },
    { value: "tsx", label: "React TSX" },
    { value: "css", label: "CSS" },
    { value: "scss", label: "SCSS" },
    { value: "php", label: "PHP" },
    { value: "markup", label: "HTML" },
    { value: "java", label: "Java" },
    { value: "python", label: "Python" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "sql", label: "SQL" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" },
    { value: "plaintext", label: "Plain Text" },
];

// Terminal-Typen-Optionen
const terminalTypeOptions = [
    { value: "bash", label: "Bash / Shell" },
    { value: "powershell", label: "PowerShell" },
    { value: "cmd", label: "Windows CMD" },
    { value: "docker", label: "Docker" },
    { value: "git", label: "Git" },
    { value: "npm", label: "NPM" },
];

export default function CodeBlockInput({
    index,
    register,
    remove,
    error,
    value,
    onChange,
    headlineValue = "",
    onHeadlineChange,
    blockTypeValue = "code",
    onBlockTypeChange,
    languageValue = "javascript",
    onLanguageChange,
}: CodeBlockInputProps) {
    // Lokale States, falls keine externen Handler übergeben werden
    const [blockType, setBlockType] = useState(blockTypeValue);
    const [language, setLanguage] = useState(languageValue);
    const [headline, setHeadline] = useState(headlineValue);

    // Handler mit Fallback auf lokalen State
    const handleBlockTypeChange = (newType: string) => {
        const newState = newType;
        if (onBlockTypeChange) {
            onBlockTypeChange(newState);
        } else {
            setBlockType(newState);
        }

        // Wenn der Block-Typ geändert wird, setze die Sprache auf die Standardsprache für diesen Typ
        const defaultLang = newType === "code" ? "javascript" : "bash";
        if (onLanguageChange) {
            onLanguageChange(defaultLang);
        } else {
            setLanguage(defaultLang);
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        if (onLanguageChange) {
            onLanguageChange(newLang);
        } else {
            setLanguage(newLang);
        }
    };

    const handleHeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHeadline = e.target.value;
        if (onHeadlineChange) {
            onHeadlineChange(newHeadline);
        } else {
            setHeadline(newHeadline);
        }
    };

    const currentBlockType = blockTypeValue || blockType;
    const currentLanguage = languageValue || language;
    const currentHeadline = headlineValue || headline;

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800">
            <div className="flex flex-col space-y-3 mb-3">
                {/* Block-Titel-Eingabefeld */}
                <div>
                    <Input
                        placeholder="Block-Titel (optional)"
                        value={currentHeadline}
                        className="mb-2"
                        {...register(`textBlocks.${index}.headline`, { onChange: handleHeadlineChange })}
                    />
                </div>

                {/* Block-Typ-Auswahl */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={currentBlockType === "code" ? "primary" : "outline"}
                        onClick={() => handleBlockTypeChange("code")}
                    >
                        Code
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={currentBlockType === "terminal" ? "primary" : "outline"}
                        onClick={() => handleBlockTypeChange("terminal")}
                    >
                        Terminal
                    </Button>
                </div>

                {/* Sprache-Auswahl basierend auf Block-Typ */}
                <div className="flex items-center justify-between gap-2">
                    <select
                        value={currentLanguage}
                        onChange={handleLanguageChange}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-2 py-1 dark:text-gray-200 flex-grow"
                    >
                        {currentBlockType === "code"
                            ? codeLanguageOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                      {option.label}
                                  </option>
                              ))
                            : terminalTypeOptions.map((option) => (
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
                placeholder={currentBlockType === "code" ? "// Dein Code hier..." : "$ Terminal Befehle hier eingeben..."}
            />

            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}

            {/* Versteckte Felder für die Formularübermittlung */}
            <input type="hidden" {...register(`textBlocks.${index}.blockType`)} value={currentBlockType} />
            <input type="hidden" {...register(`textBlocks.${index}.language`)} value={currentLanguage} />
        </div>
    );
}
