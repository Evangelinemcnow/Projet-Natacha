import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdEditor from "@/components/ads/AdEditor";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { getAdById, listCategories } from "@/lib/services/ad.service";

export default async function EditAdPage({ params }) {
    const resolvedParams = await params;
    const authUser = await getAuthenticatedUserFromCookies();

    if (!authUser?.id) {
        const nextPath = `/ads/edit/${resolvedParams.id}`;
        redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
    }

    let ad = null;
    let categories = [];
    let dataError = false;

    try {
        [ad, categories] = await Promise.all([getAdById(resolvedParams.id), listCategories()]);
    } catch {
        dataError = true;
    }

    if (dataError) {
        return (
            <main className="mx-auto w-full max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">Edition indisponible</h1>
                <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    Les donnees de l&apos;annonce ne sont pas accessibles pour le moment. Reessayez apres avoir retabli la connexion a la base.
                </p>
                <Link href="/ads" className="text-sm text-zinc-700 underline">
                    Retour aux annonces
                </Link>
            </main>
        );
    }

    if (!ad) {
        notFound();
    }

    if (Number(ad.utilisateur_id) !== Number(authUser.id)) {
        return (
            <main className="mx-auto w-full max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">Modification non autorisee</h1>
                <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    Vous ne pouvez modifier que vos propres annonces.
                </p>
                <Link href={`/ads/${resolvedParams.id}`} className="text-sm text-zinc-700 underline">
                    Retour a l&apos;annonce
                </Link>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-3xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">Modifier l&apos;annonce #{resolvedParams.id}</h1>
            <p className="mb-6 text-zinc-600">Mettez a jour les informations de votre annonce.</p>

            <AdEditor
                initialValues={{
                    titre: ad.titre,
                    description: ad.description,
                    prix: String(ad.prix),
                    localisation: ad.localisation,
                    categorieId: String(ad.categorie_id),
                    imageUrls: Array.isArray(ad.images) ? ad.images.map((image) => image.url).filter(Boolean) : [],
                }}
                categories={categories}
                endpoint={`/api/ads/${resolvedParams.id}`}
                method="PUT"
                submitLabel="Enregistrer les modifications"
                successHref={`/ads/${resolvedParams.id}`}
            />

            <Link href={`/ads/${resolvedParams.id}`} className="text-sm text-zinc-700 underline">
                Retour a l&apos;annonce
            </Link>
        </main>
    );
}
