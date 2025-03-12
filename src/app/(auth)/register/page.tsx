import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <RegisterForm />
            </div>
        </div>
    );
}
