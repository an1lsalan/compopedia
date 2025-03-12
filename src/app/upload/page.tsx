import UploadForm from "@/components/upload/UploadForm";

export const metadata = {
    title: "Komponente hochladen - Compopedia",
    description: "Lade eine neue Komponente in die Compopedia hoch",
};

export default function UploadPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Komponente hochladen</h1>
                <p className="text-gray-600 mb-8">Teile deine Komponente mit dem Team</p>
                <div className="bg-white shadow-md rounded-lg p-6">
                    <UploadForm />
                </div>
            </div>
        </div>
    );
}
