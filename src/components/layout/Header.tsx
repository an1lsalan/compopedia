"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Header() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

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

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-blue-600">
                                Compopedia
                            </Link>
                        </div>
                        <nav className="ml-6 flex space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                                        isActive(item.href)
                                            ? "border-blue-500 text-gray-900"
                                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
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
                                                ? "border-blue-500 text-gray-900"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                        </nav>
                    </div>
                    <div className="flex items-center">
                        {status === "authenticated" ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">Hi, {session.user.name}</span>
                                <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link href="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button>Registrieren</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
