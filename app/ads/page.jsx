import Link from "next/link";
import AdList from "@/components/ads/AdList";
import SearchBar from "@/components/search/SearchBar";
import { listCategories, searchAds } from "@/lib/services/ad.service";

export const metadata = {
    title: "Annonces",
    description: "Liste des annonces",
};

function normalizeParam(value) {
    return typeof value === "string" ? value : "";
}

export default async function AdsPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const filters = {
        q: normalizeParam(resolvedSearchParams?.q),
        categoryId: normalizeParam(resolvedSearchParams?.categoryId),
        minPrice: normalizeParam(resolvedSearchParams?.minPrice),
        maxPrice: normalizeParam(resolvedSearchParams?.maxPrice),
        location: normalizeParam(resolvedSearchParams?.location),
    };
    let ads = [];
    let categories = [];
    let dataError = false;

    try {
        [ads, categories] = await Promise.all([searchAds(filters), listCategories()]);
    } catch {
        dataError = true;
    }

    const activeFilters = Object.values(filters).filter(Boolean).length;
    const filterWord = activeFilters > 1 ? "filtres" : "filtre";
    const activeWord = activeFilters > 1 ? "actifs" : "actif";
    const availabilityText = activeFilters > 0
        ? ` pour ${activeFilters} ${filterWord} ${activeWord}`
        : " disponibles";

    return (
        <main className="mx-auto w-full max-w-6xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Annonces</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        {ads.length} resultat{ads.length > 1 ? "s" : ""}{availabilityText}
                    </p>
                </div>
                <Link href="/ads/create" className="rounded-md bg-black px-4 py-2 text-sm text-white">
                    Deposer une annonce
                </Link>
            </div>

            <div className="mb-6">
                <SearchBar initialValues={filters} categories={categories} />
            </div>

            {dataError ? (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Impossible de charger les annonces pour le moment. Verifiez la connexion a la base de donnees puis reessayez.
                </div>
            ) : null}

            <AdList ads={ads} />
        </main>
    );
}
