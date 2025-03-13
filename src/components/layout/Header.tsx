// src/components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigation = [
        { name: "Home", href: "/" },
        { name: "Components", href: "/components" },
    ];

    const authNavigation = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Upload", href: "/upload" },
    ];

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path !== "/" && pathname.startsWith(path)) return true;
        return false;
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                Compopedia
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:ml-6 md:flex md:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                                        isActive(item.href)
                                            ? "border-blue-500 text-gray-900 dark:text-white dark:border-blue-400"
                                            : "border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {status === "authenticated" &&
                                authNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                                            isActive(item.href)
                                                ? "border-blue-500 text-gray-900 dark:text-white dark:border-blue-400"
                                                : "border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                        </nav>
                    </div>

                    <div className="flex items-center">
                        <DarkModeToggle />

                        {/* Desktop Authentication */}
                        <div className="hidden md:flex">
                            {status === "authenticated" ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Hi, {session.user.name}</span>
                                    <Button
                                        variant="ghost"
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                                    >
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex space-x-4">
                                    <Link href="/login">
                                        <Button variant="ghost" className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button className="dark:bg-blue-600 dark:hover:bg-blue-700">Registrieren</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center ml-4">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                                onClick={toggleMenu}
                            >
                                <span className="sr-only">Menü öffnen</span>
                                {isMenuOpen ? (
                                    <svg
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    isActive(item.href)
                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {status === "authenticated" &&
                            authNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                                        isActive(item.href)
                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                    </div>

                    <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                        {status === "authenticated" ? (
                            <div className="px-2 space-y-1">
                                <div className="px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Hi, {session.user.name}</div>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        signOut({ callbackUrl: "/" });
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="px-2 space-y-1">
                                <Link
                                    href="/login"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Registrieren
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
