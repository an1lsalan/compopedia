import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
                <LoginForm />
            </div>
        </div>
    );
}
