"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import TextBlockInput from "./TextBlockInput";
import ImageUpload from "./ImageUpload";
import { Component, Category } from "@/types/index";

const uploadSchema = z.object({
    title: z.string().min(3, "Titel muss mindestens 3 Zeichen lang sein"),
    description: z.string().min(10, "Beschreibung muss mindestens 10 Zeichen lang sein"),
    categoryId: z.string().optional(),
    categoryName: z.string().optional(),
    textBlocks: z.array(
        z.object({
            content: z.string().min(1, "Code-Block darf nicht leer sein"),
        })
    ),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadFormProps {
    initialData?: Component;
}

export default function UploadForm({ initialData }: UploadFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [isNewCategory, setIsNewCategory] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<UploadFormData>({
        resolver: zodResolver(uploadSchema),
        defaultValues: initialData
            ? {
                  title: initialData.title,
                  description: initialData.description,
                  categoryId: initialData.categoryId,
                  textBlocks: initialData.textBlocks.map((block) => ({
                      content: block.content,
                  })),
              }
            : {
                  title: "",
                  description: "",
                  categoryId: "",
                  textBlocks: [{ content: "" }],
              },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "textBlocks",
    });

    // Kategorie-Auswahl überwachen
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const categoryId = watch("categoryId");

    // Kategorien laden
    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await axios.get("/api/categories");
                setCategories(response.data);
            } catch (error) {
                setError("Kategorien konnten nicht geladen werden");
                console.error("Fehler beim Laden der Kategorien:", error);
            }
        }

        fetchCategories();
    }, []);

    const onSubmit = async (data: UploadFormData) => {
        if (!session?.user?.id) {
            setError("Du musst angemeldet sein, um eine Komponente hochzuladen");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Bilder hochladen und URLs erhalten
            const uploadedImages = await Promise.all(
                images.map(async (file) => {
                    // Hier würde normalerweise der Upload zu einem Cloud Storage erfolgen
                    // Für dieses Beispiel simulieren wir einen erfolgreichen Upload
                    const url = URL.createObjectURL(file);
                    return { url };
                })
            );

            const componentData = {
                ...data,
                userId: session.user.id,
                images: uploadedImages,
            };

            let response;

            if (initialData) {
                // Komponente aktualisieren
                response = await axios.put(`/api/components/${initialData.id}`, componentData);
            } else {
                // Neue Komponente erstellen
                response = await axios.post("/api/components", componentData);
            }

            router.push(`/components/${response.data.id}`);
        } catch (error) {
            console.error("Fehler beim Hochladen der Komponente:", error);
            setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (files: File[]) => {
        setImages(files);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div>
                <Input label="Titel" placeholder="Name der Komponente" error={errors.title?.message} {...register("title")} />
            </div>

            <div>
                <Textarea
                    label="Beschreibung"
                    placeholder="Beschreibe die Komponente und ihre Verwendungszwecke"
                    error={errors.description?.message}
                    {...register("description")}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {!isNewCategory ? (
                        <>
                            <select
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                {...register("categoryId")}
                                onChange={(e) => {
                                    if (e.target.value === "new") {
                                        setIsNewCategory(true);
                                        setValue("categoryId", "");
                                    } else {
                                        setValue("categoryId", e.target.value);
                                    }
                                }}
                            >
                                <option value="">Kategorie auswählen</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                                <option value="new">Neue Kategorie erstellen</option>
                            </select>
                            <div></div>
                        </>
                    ) : (
                        <>
                            <Input placeholder="Name der neuen Kategorie" {...register("categoryName")} />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsNewCategory(false);
                                    setValue("categoryName", "");
                                }}
                            >
                                Zurück zur Auswahl
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bilder</label>
                <ImageUpload onChange={handleImageChange} initialImages={initialData?.images} />
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Code-Blöcke</label>
                    <Button type="button" onClick={() => append({ content: "" })} variant="outline" size="sm">
                        Block hinzufügen
                    </Button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <TextBlockInput
                            key={field.id}
                            index={index}
                            register={register}
                            remove={remove}
                            error={errors.textBlocks && errors.textBlocks[index]?.content?.message}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Abbrechen
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {initialData ? "Komponente aktualisieren" : "Komponente hochladen"}
                </Button>
            </div>
        </form>
    );
}
