// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/auth/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Compopedia - Component Library",
    description: "Enzyklopädie für Komponenten aller Art",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="de" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-title" content="Compopedia" />
            </head>
            <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <AuthProvider session={session}>
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-grow">{children}</main>
                            <Footer />
                        </div>
                    </AuthProvider>
                </ThemeProvider>
                <Toaster position="top-right" />
            </body>
        </html>
    );
}
