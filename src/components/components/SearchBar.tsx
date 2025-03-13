"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="flex w-full max-w-lg mb-6">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Komponente suchen..." className="flex-grow" />
            <Button type="submit" className="ml-2">
                Suchen
            </Button>
        </form>
    );
}
