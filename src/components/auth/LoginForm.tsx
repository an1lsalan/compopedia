"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const loginSchema = z.object({
    email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
    password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            if (result?.error) {
                setError("Ungültige Anmeldedaten. Bitte versuche es erneut.");
                return;
            }

            router.push(callbackUrl);
        } catch {
            setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Anmelden</h1>
                <p className="text-gray-600 mt-2 dark:text-gray-300">Melde dich mit deinen Zugangsdaten an</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input label="E-Mail" type="email" placeholder="name@firma.de" error={errors.email?.message} {...register("email")} />

                <Input label="Passwort" type="password" placeholder="******" error={errors.password?.message} {...register("password")} />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Anmelden
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Noch kein Konto?{" "}
                    <Link href="/register" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                        Jetzt registrieren
                    </Link>
                </p>
            </div>
        </div>
    );
}
