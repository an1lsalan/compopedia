"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const accountSchema = z
    .object({
        name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
        email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
        confirmNewPassword: z.string().optional(),
    })
    .refine((data) => !data.newPassword || data.newPassword === data.confirmNewPassword, {
        message: "Passwörter stimmen nicht überein",
        path: ["confirmNewPassword"],
    })
    .refine((data) => !data.newPassword || data.newPassword.length >= 6, {
        message: "Neues Passwort muss mindestens 6 Zeichen lang sein",
        path: ["newPassword"],
    })
    .refine((data) => !data.newPassword || data.currentPassword, {
        message: "Aktuelles Passwort ist erforderlich",
        path: ["currentPassword"],
    });

type AccountFormData = z.infer<typeof accountSchema>;

export default function AccountDetails() {
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    const onSubmit = async (data: AccountFormData) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await axios.put("/api/users/profile", {
                name: data.name,
                email: data.email,
                currentPassword: data.currentPassword || undefined,
                newPassword: data.newPassword || undefined,
            });

            // Sitzung aktualisieren, damit die Änderungen sofort sichtbar sind
            if (session) {
                await update({
                    ...session,
                    user: {
                        ...session.user,
                        name: data.name,
                        email: data.email,
                    },
                });
            }

            setSuccessMessage("Profil erfolgreich aktualisiert");

            // Passwortfelder zurücksetzen
            reset({
                name: data.name,
                email: data.email,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Ein Fehler ist aufgetreten";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 dark:bg-green-900 dark:text-green-200">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:text-red-200">{error}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <Input label="Name" placeholder="Dein Name" error={errors.name?.message} {...register("name")} />
                </div>

                <div>
                    <Input label="E-Mail" type="email" placeholder="name@firma.de" error={errors.email?.message} {...register("email")} />
                </div>

                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                    <h3 className="text-lg font-medium mb-4">Passwort ändern</h3>
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-300">
                        Lasse die Felder leer, wenn du dein Passwort nicht ändern möchtest
                    </p>

                    <div className="space-y-4">
                        <Input
                            label="Aktuelles Passwort"
                            type="password"
                            placeholder="********"
                            error={errors.currentPassword?.message}
                            {...register("currentPassword")}
                        />

                        <Input
                            label="Neues Passwort"
                            type="password"
                            placeholder="********"
                            error={errors.newPassword?.message}
                            {...register("newPassword")}
                        />

                        <Input
                            label="Neues Passwort bestätigen"
                            type="password"
                            placeholder="********"
                            error={errors.confirmNewPassword?.message}
                            {...register("confirmNewPassword")}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" isLoading={isLoading}>
                        Änderungen speichern
                    </Button>
                </div>
            </form>
        </div>
    );
}
