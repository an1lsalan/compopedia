"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import ComponentCard from "./ComponentCard";
import CategoryFilter from "./CategoryFilter";
import SkeletonLoader from "./SkeletonLoader";
import { Component, Category } from "@/types/index";
import { motion } from "framer-motion";
import SortOptions from "./SortOptions";

export default function ComponentsList() {
    const [components, setComponents] = useState<Component[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const [sortOption, setSortOption] = useState<string>("createdAt:desc");

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Fehler beim Laden der Kategorien:", error);
            setError("Kategorien konnten nicht geladen werden");
        }
    };

    const fetchComponents = async (pageNumber: number, reset: boolean = false) => {
        try {
            setIsLoading(true);
            setError(null);

            // Parse die Sortieroptionen
            const [sortBy, sortOrder] = sortOption.split(":");

            let url = `/api/components?page=${pageNumber}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;
            if (selectedCategory) {
                url += `&categoryId=${selectedCategory}`;
            }

            const response = await axios.get(url);
            const { components: newComponents, pagination } = response.data;

            setComponents((prevComponents) => (reset ? newComponents : [...prevComponents, ...newComponents]));
            setHasMore(pagination.page < pagination.pages);
        } catch (error) {
            console.error("Fehler beim Laden der Komponenten:", error);
            setError("Komponenten konnten nicht geladen werden");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSortChange = (option: string) => {
        setSortOption(option);
        setPage(1); // Zurück zur ersten Seite bei Sortierungsänderung
    };

    useEffect(() => {
        fetchComponents(page, page === 1);
    }, [page, selectedCategory, sortOption]); // sortOption zur Abhängigkeitsliste hinzufügen

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

    // Effekt zum Laden der Kategorien
    useEffect(() => {
        fetchCategories();
    }, []);

    // Effekt zum Laden der Komponenten
    useEffect(() => {
        fetchComponents(page, page === 1);
    }, [page, selectedCategory]);

    // Kategorie-Filter ändern
    const handleCategoryChange = (categoryId: string | null) => {
        setSelectedCategory(categoryId);
        setPage(1); // Zurück zur ersten Seite
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <CategoryFilter categories={categories} selectedCategory={selectedCategory} onChange={handleCategoryChange} />
            </div>

            <SortOptions onSort={handleSortChange} />

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            {components.length === 0 && !isLoading ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">Keine Komponenten gefunden</p>
                </div>
            ) : (
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
            )}

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {[...Array(3)].map((_, i) => (
                        <SkeletonLoader key={i} />
                    ))}
                </div>
            )}

            <div ref={loadingRef} className="h-10" />
        </div>
    );
}
