"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdForm({
    initialValues,
    categories = [],
    onSubmit,
    submitLabel = "Enregistrer",
    submitting = false,
}) {
    const [form, setForm] = useState({
        titre: initialValues?.titre ?? "",
        description: initialValues?.description ?? "",
        prix: initialValues?.prix ?? "",
        localisation: initialValues?.localisation ?? "",
        categorieId: initialValues?.categorieId ?? "",
        imageUrls: Array.isArray(initialValues?.imageUrls) ? initialValues.imageUrls : [],
    });
    const [uploadState, setUploadState] = useState({
        uploading: false,
        message: "",
        tone: "idle",
    });

    function handleChange(event) {
        setForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (onSubmit) {
            await onSubmit(form);
        }
    }

    async function handleUpload(event) {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) {
            return;
        }

        setUploadState({ uploading: true, message: "Upload en cours...", tone: "idle" });

        try {
            const uploadedUrls = [];

            for (const file of files.slice(0, 6)) {
                const payload = new FormData();
                payload.append("file", file);

                const response = await fetch("/api/uploads", {
                    method: "POST",
                    body: payload,
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Echec de l'upload.");
                }

                if (result.data?.url) {
                    uploadedUrls.push(result.data.url);
                }
            }

            setForm((prev) => {
                const merged = [...prev.imageUrls, ...uploadedUrls];
                const unique = [...new Set(merged)].slice(0, 6);

                return {
                    ...prev,
                    imageUrls: unique,
                };
            });

            setUploadState({
                uploading: false,
                message: "Image(s) ajoutee(s) avec succes.",
                tone: "success",
            });
        } catch (error) {
            setUploadState({
                uploading: false,
                message: error instanceof Error ? error.message : "Upload impossible.",
                tone: "error",
            });
        } finally {
            event.target.value = "";
        }
    }

    function removeImage(urlToRemove) {
        setForm((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((url) => url !== urlToRemove),
        }));
    }

    let uploadToneClass = "text-zinc-700";

    if (uploadState.tone === "error") {
        uploadToneClass = "text-red-700";
    } else if (uploadState.tone === "success") {
        uploadToneClass = "text-green-700";
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1 text-sm text-zinc-700">
                <span className="font-medium text-zinc-900">Titre</span>
                <Input name="titre" placeholder="Ex: Velo de ville" value={form.titre} onChange={handleChange} required />
            </label>

            <label className="block space-y-1 text-sm text-zinc-700">
                <span className="font-medium text-zinc-900">Description</span>
                <textarea
                    name="description"
                    placeholder="Decrivez votre annonce"
                    value={form.description}
                    onChange={handleChange}
                    className="min-h-32 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                    required
                />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-1 text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Prix</span>
                    <Input
                        name="prix"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="120"
                        value={form.prix}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label className="block space-y-1 text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Localisation</span>
                    <Input
                        name="localisation"
                        placeholder="Ex: Roubaix"
                        value={form.localisation}
                        onChange={handleChange}
                        required
                    />
                </label>
            </div>

            <label className="block space-y-1 text-sm text-zinc-700">
                <span className="font-medium text-zinc-900">Categorie</span>
                {categories.length > 0 ? (
                    <select
                        name="categorieId"
                        value={form.categorieId}
                        onChange={handleChange}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                        required
                    >
                        <option value="">Choisir une categorie</option>
                        {categories.map((category) => (
                            <option key={category.id} value={String(category.id)}>
                                {category.nom}
                            </option>
                        ))}
                    </select>
                ) : (
                    <Input
                        name="categorieId"
                        placeholder="Categorie ID"
                        value={form.categorieId}
                        onChange={handleChange}
                        required
                    />
                )}
            </label>

            <div className="space-y-2 rounded-lg border border-zinc-200 p-3">
                <p className="text-sm font-medium text-zinc-900">Images (max 6)</p>
                <p className="text-xs text-zinc-600">La premiere image sera utilisee comme image principale.</p>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    disabled={uploadState.uploading || form.imageUrls.length >= 6}
                    className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2"
                />

                {uploadState.message ? (
                    <p className={`text-xs ${uploadToneClass}`}>
                        {uploadState.message}
                    </p>
                ) : null}

                {form.imageUrls.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-3">
                        {form.imageUrls.map((url, index) => (
                            <div key={url} className="rounded-md border border-zinc-200 p-2">
                                <Image
                                    src={url}
                                    alt={`Annonce ${index + 1}`}
                                    width={320}
                                    height={96}
                                    className="h-24 w-full rounded object-cover"
                                    unoptimized
                                />
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-zinc-600">{index === 0 ? "Principale" : `Image ${index + 1}`}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(url)}
                                        className="text-xs text-red-700 underline"
                                    >
                                        Retirer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <Button type="submit" disabled={submitting}>
                {submitting ? "Enregistrement..." : submitLabel}
            </Button>
        </form>
    );
}
