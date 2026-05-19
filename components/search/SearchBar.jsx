"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SearchBar({ initialValues, categories = [] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [filters, setFilters] = useState({
        q: initialValues?.q ?? "",
        categoryId: initialValues?.categoryId ?? "",
        minPrice: initialValues?.minPrice ?? "",
        maxPrice: initialValues?.maxPrice ?? "",
        location: initialValues?.location ?? "",
    });

    function handleChange(event) {
        setFilters((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const nextParams = new URLSearchParams(searchParams.toString());

        Object.entries(filters).forEach(([key, value]) => {
            const trimmedValue = value.trim();

            if (trimmedValue) {
                nextParams.set(key, trimmedValue);
            } else {
                nextParams.delete(key);
            }
        });

        const queryString = nextParams.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }

    function handleReset() {
        setFilters({
            q: "",
            categoryId: "",
            minPrice: "",
            maxPrice: "",
            location: "",
        });
        router.push(pathname);
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-1 text-sm text-zinc-700 xl:col-span-2">
                <span className="font-medium text-zinc-900">Mot-cle</span>
                <Input
                    name="q"
                    value={filters.q}
                    onChange={handleChange}
                    placeholder="Ex: velo, studio, jardinage"
                />
            </label>

            <label className="space-y-1 text-sm text-zinc-700">
                <span className="font-medium text-zinc-900">Categorie</span>
                {categories.length > 0 ? (
                    <select
                        name="categoryId"
                        value={filters.categoryId}
                        onChange={handleChange}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                    >
                        <option value="">Toutes</option>
                        {categories.map((category) => (
                            <option key={category.id} value={String(category.id)}>
                                {category.nom}
                            </option>
                        ))}
                    </select>
                ) : (
                    <Input
                        name="categoryId"
                        value={filters.categoryId}
                        onChange={handleChange}
                        placeholder="ID categorie"
                    />
                )}
            </label>

            <label className="space-y-1 text-sm text-zinc-700">
                <span className="font-medium text-zinc-900">Prix minimum</span>
                <Input
                    name="minPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={filters.minPrice}
                    onChange={handleChange}
                    placeholder="0"
                />
            </label>

            <label className="space-y-1 text-sm text-zinc-700">
                <span className="font-medium text-zinc-900">Prix maximum</span>
                <Input
                    name="maxPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    placeholder="2000"
                />
            </label>

            <label className="space-y-1 text-sm text-zinc-700 xl:col-span-2">
                <span className="font-medium text-zinc-900">Localisation</span>
                <Input
                    name="location"
                    value={filters.location}
                    onChange={handleChange}
                    placeholder="Ex: Lille, Paris, Marseille"
                />
            </label>

            <div className="flex items-end gap-2 xl:col-span-3 xl:justify-end">
                <Button type="button" className="bg-zinc-100 text-zinc-900" onClick={handleReset}>
                    Reinitialiser
                </Button>
                <Button type="submit">Rechercher</Button>
            </div>
        </form>
    );
}
