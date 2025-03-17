"use client";

import { useEffect, RefObject } from "react";

interface SearchShortcutProps {
    inputRef: RefObject<HTMLInputElement | null> | null; // Erweiterte Typunterstützung
    shortcut?: string;
}

export default function SearchShortcut({ inputRef, shortcut = "/" }: SearchShortcutProps) {
    const isInputElement = (element: Element | null): element is HTMLInputElement | HTMLTextAreaElement => {
        return element !== null && (element.tagName === "INPUT" || element.tagName === "TEXTAREA");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        // Wenn der Shortcut gedrückt wird und kein Eingabefeld aktiv ist
        if (e.key === shortcut && !isInputElement(document.activeElement)) {
            e.preventDefault();

            if (inputRef && inputRef.current) {
                inputRef.current.focus();

                // Sicherstellen, dass der Text markiert wird, falls bereits etwas im Suchfeld steht
                inputRef.current.select();
            }
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return null; // Diese Komponente hat keine visuelle Repräsentation
}
