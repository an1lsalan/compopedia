"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { signIn } from "next-auth/react";

const registerSchema = z
    .object({
        name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
        email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
        password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwörter stimmen nicht überein",
        path: ["confirmPassword"],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            await axios.post("/api/auth/register", {
                name: data.name,
                email: data.email,
                password: data.password,
            });

            // Automatisch anmelden nach der Registrierung
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            if (result?.error) {
                setError("Fehler bei der Anmeldung. Bitte melde dich manuell an.");
                router.push("/login");
                return;
            }

            router.push("/dashboard");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Registrieren</h1>
                <p className="text-gray-600 mt-2 dark:text-gray-300">Erstelle ein neues Konto</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:text-red-200">{error}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input label="Name" type="text" placeholder="Dein Name" error={errors.name?.message} {...register("name")} />

                <Input label="E-Mail" type="email" placeholder="name@firma.de" error={errors.email?.message} {...register("email")} />

                <Input label="Passwort" type="password" placeholder="******" error={errors.password?.message} {...register("password")} />

                <Input
                    label="Passwort bestätigen"
                    type="password"
                    placeholder="******"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Registrieren
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Bereits registriert?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                        Jetzt anmelden
                    </Link>
                </p>
            </div>
        </div>
    );
}
