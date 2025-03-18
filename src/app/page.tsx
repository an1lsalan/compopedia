// src/app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function Home() {
    const { data: session } = useSession();

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <section className="flex flex-col md:flex-row items-center mb-16">
                <motion.div
                    className="md:w-1/2 mb-8 md:mb-0 md:pr-8"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Die Komponenten-Bibliothek für dein Team</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                        Compopedia hilft dir und deinem Team, Komponenten zu dokumentieren, zu teilen und wiederzuverwenden. Vereinfache die
                        Zusammenarbeit und beschleunige die Entwicklung.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {session ? (
                            <>
                                <Link href="/upload">
                                    <Button size="lg">Komponente hochladen</Button>
                                </Link>
                                <Link href="/components">
                                    <Button variant="outline" size="lg">
                                        Komponenten entdecken
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/register">
                                    <Button size="lg">Jetzt registrieren</Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="outline" size="lg">
                                        Anmelden
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
                <motion.div
                    className="md:w-1/2 relative h-64 md:h-96"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="relative w-full h-full overflow-hidden rounded-lg shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                        <Image src="/assets/dashboard-preview.png" alt="Compopedia Dashboard Preview" fill className="object-cover" priority />
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="mb-16">
                <motion.h2
                    className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Warum Compopedia?
                </motion.h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: "/assets/window.svg",
                            title: "Komponenten organisieren",
                            description: "Strukturiere und kategorisiere deine Komponenten für schnellen Zugriff und einfache Wiederverwendung.",
                        },
                        {
                            icon: "/assets/file.svg",
                            title: "Code dokumentieren",
                            description: "Dokumentiere deine Komponenten mit Code-Snippets, Terminal-Befehlen und Bildern.",
                        },
                        {
                            icon: "/assets/globe.svg",
                            title: "Im Team teilen",
                            description: "Teile Wissen und Komponenten mit deinem Team und sorge für einheitliche Standards.",
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        >
                            <div className="w-12 h-12 mb-4 relative">
                                <Image src={feature.icon} alt={feature.title} fill className="object-contain" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 dark:text-white">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Getting Started Section */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-8 mb-16">
                <motion.h2
                    className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    So einfach ist es
                </motion.h2>

                <div className="grid md:grid-cols-4 gap-8">
                    {[
                        { step: 1, title: "Registrieren", description: "Erstelle ein Konto, um auf alle Funktionen zugreifen zu können." },
                        { step: 2, title: "Komponente hochladen", description: "Lade deine erste Komponente mit Code und Dokumentation hoch." },
                        { step: 3, title: "Kategorisieren", description: "Ordne deine Komponente einer passenden Kategorie zu." },
                        { step: 4, title: "Teilen & Entdecken", description: "Teile deine Komponente mit anderen und entdecke ihre Beiträge." },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col items-center text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-xl font-bold mb-4">
                                {item.step}
                            </div>
                            <h3 className="text-lg font-semibold mb-2 dark:text-white">{item.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="text-center py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h2 className="text-3xl font-bold mb-6 dark:text-white">Bereit, mit dem Team zusammenzuarbeiten?</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Beginn noch heute, deine Komponenten zu organisieren und mit deinem Team zu teilen.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {session ? (
                            <Link href="/upload">
                                <Button size="lg">Erste Komponente hochladen</Button>
                            </Link>
                        ) : (
                            <Link href="/register">
                                <Button size="lg">Jetzt starten</Button>
                            </Link>
                        )}
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
