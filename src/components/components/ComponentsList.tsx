/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ComponentCard from "./ComponentCard";
import CategoryFilter from "./CategoryFilter";
import SearchBar from "./SearchBar";
import { Component, Category } from "@/types/index";
import { motion, AnimatePresence } from "framer-motion";
import SortOptions from "./SortOptions";
import toast from "react-hot-toast";

export default function ComponentsList() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [components, setComponents] = useState<Component[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("categoryId"));
    const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "");
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const [sortOption, setSortOption] = useState<string>(searchParams.get("sort") || "createdAt:desc");
    const [total, setTotal] = useState(0);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    // URL-Parameter aktualisieren
    const updateUrlParams = useCallback(() => {
        const params = new URLSearchParams();

        if (selectedCategory) {
            params.set("categoryId", selectedCategory);
        }

        if (searchQuery) {
            params.set("search", searchQuery);
        }

        if (sortOption !== "createdAt:desc") {
            params.set("sort", sortOption);
        }

        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", newUrl);
    }, [selectedCategory, searchQuery, sortOption]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Fehler beim Laden der Kategorien:", error);
            setError("Kategorien konnten nicht geladen werden");
            toast.error("Fehler beim Laden der Kategorien");
        }
    };

    // Komponenten laden - vereinfachte Version
    const fetchComponents = async (pageNumber: number, resetList: boolean = false) => {
        try {
            setIsLoading(true);

            // Parse die Sortieroptionen
            const [sortBy, sortOrder] = sortOption.split(":");

            let url = `/api/components?page=${pageNumber}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;

            if (selectedCategory) {
                url += `&categoryId=${selectedCategory}`;
            }

            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }

            console.log("API-Anfrage:", url);

            const response = await axios.get(url);
            console.log("API-Antwort:", response.data);

            const { components: newComponents, pagination } = response.data;

            setComponents(resetList ? newComponents : [...components, ...newComponents]);
            setHasMore(pagination.page < pagination.pages);
            setTotal(pagination.total);
        } catch (error) {
            console.error("Fehler beim Laden der Komponenten:", error);
            setError("Komponenten konnten nicht geladen werden");
            toast.error("Fehler beim Laden der Komponenten");
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    // Einfache und direkte Suchfunktion
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPage(1);
        setIsSearching(true);

        // Direktes Laden ohne Verzögerung
        fetchComponents(1, true);
    };

    // Direkte Sortierung
    const handleSortChange = (option: string) => {
        setSortOption(option);
        setPage(1);
        fetchComponents(1, true);
    };

    // URL und Inhalte synchronisieren
    useEffect(() => {
        updateUrlParams();
    }, [selectedCategory, searchQuery, sortOption, updateUrlParams]);

    // Erstes Laden
    useEffect(() => {
        fetchComponents(1, true);
        fetchCategories();
    }, []);

    // Wenn sich die Kategorie ändert, neu laden
    useEffect(() => {
        if (!isLoading) {
            // Vermeide doppeltes Laden beim Start
            setPage(1);
            fetchComponents(1, true);
        }
    }, [selectedCategory]);

    // Pagination
    useEffect(() => {
        if (page > 1 && !isSearching) {
            fetchComponents(page, false);
        }
    }, [page]);

    // Intersection Observer für Endless Scrolling
    const lastComponentRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prevPage) => prevPage + 1);
                }
            });

            if (node) observer.current.observe(node);
        },
        [isLoading, hasMore]
    );

    // Kategorie-Filter ändern
    const handleCategoryChange = (categoryId: string | null) => {
        setSelectedCategory(categoryId);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <CategoryFilter categories={categories} selectedCategory={selectedCategory} onChange={handleCategoryChange} />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <SearchBar onSearch={handleSearch} initialQuery={searchQuery} placeholder="Nach Komponententitel suchen..." shortcut="/" />
                <SortOptions onSort={handleSortChange} currentSort={sortOption} />
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? (
                        <span>
                            Suchergebnisse für <strong>{searchQuery}</strong>: {total} {total === 1 ? "Komponente" : "Komponenten"} gefunden
                        </span>
                    ) : (
                        <span>
                            Insgesamt {total} {total === 1 ? "Komponente" : "Komponenten"}
                        </span>
                    )}
                </p>
            </div>

            {/* Ladeindikator */}
            <AnimatePresence>
                {(isLoading || isSearching) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center my-8">
                        <div className="loader">{isSearching ? "Suche läuft..." : "Wird geladen..."}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keine Komponenten gefunden */}
            {components.length === 0 && !isLoading && !isSearching ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    {searchQuery ? (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto mb-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">
                                Keine Ergebnisse gefunden für <strong>{searchQuery}</strong>
                            </p>
                            <button onClick={() => handleSearch("")} className="mt-3 text-blue-600 dark:text-blue-400 hover:underline">
                                Suche zurücksetzen
                            </button>
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Keine Komponenten gefunden</p>
                    )}
                </div>
            ) : (
                !isLoading &&
                !isSearching && (
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={container} initial="hidden" animate="show">
                        {components.map((component, index) => {
                            if (components.length === index + 1) {
                                return (
                                    <div ref={lastComponentRef} key={component.id}>
                                        <ComponentCard component={component} />
                                    </div>
                                );
                            } else {
                                return <ComponentCard key={component.id} component={component} />;
                            }
                        })}
                    </motion.div>
                )
            )}

            <div ref={loadingRef} className="h-10" />
        </div>
    );
}
