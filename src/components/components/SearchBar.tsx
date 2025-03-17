"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
    onSearch: (query: string) => void;
    initialQuery?: string;
    placeholder?: string;
    shortcut?: string;
}

export default function SearchBar({ onSearch, initialQuery = "", placeholder = "Nach Komponententitel suchen...", shortcut = "/" }: SearchBarProps) {
    const [inputValue, setInputValue] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);

    // Anfangswert setzen
    useEffect(() => {
        setInputValue(initialQuery);
    }, [initialQuery]);

    // Tastatur-Shortcut hinzufügen
    useEffect(() => {
        const isInputElement = (element: Element | null): element is HTMLInputElement | HTMLTextAreaElement => {
            return element !== null && (element.tagName === "INPUT" || element.tagName === "TEXTAREA");
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Wenn der Shortcut gedrückt wird und kein Eingabefeld aktiv ist
            if (e.key === shortcut && !isInputElement(document.activeElement)) {
                e.preventDefault();
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [shortcut]);

    // Direkte Suche ohne Verzögerungen
    const executeSearch = (query: string) => {
        onSearch(query);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeSearch(inputValue);
    };

    const handleClear = () => {
        setInputValue("");
        executeSearch("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Einfache Änderungsverfolgung ohne Debounce
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    return (
        <form onSubmit={handleSubmit} className="relative flex w-full max-w-xl">
            <div className="relative flex-grow group">
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="pr-10"
                    aria-label="Suche"
                />

                {/* Shortcut Hint */}
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 opacity-70 hidden md:flex items-center">
                    {shortcut}
                </div>

                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label="Suche zurücksetzen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            <Button type="submit" className="ml-2" onClick={() => executeSearch(inputValue)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Suchen
            </Button>
        </form>
    );
}
