import ComponentsList from "@/components/components/ComponentsList";

export const metadata = {
    title: "Komponenten - Compopedia",
    description: "Durchsuche alle verfügbaren Komponenten",
};

export default function ComponentsPage() {
    return (
        <div className="py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-2">Komponenten</h1>
                <p className="text-gray-600 mb-8">Durchsuche alle verfügbaren Komponenten nach Kategorien</p>
                <ComponentsList />
            </div>
        </div>
    );
}
