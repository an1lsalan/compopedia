// src/components/layout/Footer.tsx
export default function Footer() {
    return (
        <footer className="py-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4">
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Compopedia. Alle Rechte vorbehalten.
                </p>
            </div>
        </footer>
    );
}
