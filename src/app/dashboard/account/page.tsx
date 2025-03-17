import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AccountDetails from "@/components/dashboard/AccountDetails";

export const metadata = {
    title: "Kontoeinstellungen - Compopedia",
    description: "Verwalte deine Kontoeinstellungen",
};

export default async function AccountPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Kontoeinstellungen</h1>
                <p className="text-gray-600 mb-8 dark:text-gray-300">Verwalte deine persönlichen Daten und Passwort</p>
                <div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
                    <AccountDetails />
                </div>
            </div>
        </div>
    );
}
