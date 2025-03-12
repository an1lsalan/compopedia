import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Header from "@/components/layout/Header";
import AuthProvider from "@/components/auth/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Compopedia - Component Library",
    description: "A library of reusable components for your projects",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="de">
            <body className={inter.className}>
                <AuthProvider session={session}>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-grow">{children}</main>
                        <footer className="py-6 bg-gray-50 border-t">
                            <div className="container mx-auto px-4">
                                <p className="text-center text-gray-500 text-sm">
                                    &copy; {new Date().getFullYear()} Compopedia. Alle Rechte vorbehalten.
                                </p>
                            </div>
                        </footer>
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
