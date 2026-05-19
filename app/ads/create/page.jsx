import Link from "next/link";
import { redirect } from "next/navigation";
import AdEditor from "@/components/ads/AdEditor";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { listCategories } from "@/lib/services/ad.service";

export const metadata = {
    title: "Creer une annonce",
    description: "Publication d'une annonce",
};

export default async function CreateAdPage() {
    const authUser = await getAuthenticatedUserFromCookies();

    if (!authUser?.id) {
        redirect("/auth/login?next=%2Fads%2Fcreate");
    }

    const categories = await listCategories();

    return (
        <main className="mx-auto w-full max-w-3xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">Creer une annonce</h1>
            <p className="mb-6 text-zinc-600">Renseignez les informations essentielles pour publier votre annonce.</p>

            <AdEditor categories={categories} endpoint="/api/ads" method="POST" submitLabel="Publier l'annonce" />

            <Link href="/ads" className="text-sm text-zinc-700 underline">
                Retour aux annonces
            </Link>
        </main>
    );
}
