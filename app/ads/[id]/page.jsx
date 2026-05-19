import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactSellerForm from "@/components/messages/ContactSellerForm";
import DeleteAdButton from "@/components/ads/DeleteAdButton";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { getAdById } from "@/lib/services/ad.service";

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    let ad = null;

    try {
        ad = await getAdById(resolvedParams.id);
    } catch {
        ad = null;
    }

    return {
        title: ad ? ad.titre : `Annonce ${resolvedParams.id}`,
    };
}

export default async function AdDetailPage({ params }) {
    const resolvedParams = await params;
    let ad = null;
    let authUser = null;
    let dataError = false;

    try {
        [ad, authUser] = await Promise.all([
            getAdById(resolvedParams.id),
            getAuthenticatedUserFromCookies(),
        ]);
    } catch {
        dataError = true;
    }

    if (dataError) {
        return (
            <main className="mx-auto w-full max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">Annonce indisponible</h1>
                <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    Le detail de cette annonce est momentanement inaccessible. Verifiez la connexion a la base de donnees puis reessayez.
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

    const isOwner = Number(authUser?.id) === Number(ad.utilisateur_id);
    const canContactSeller = !isOwner && Boolean(authUser?.id);
    const adPath = `/ads/${resolvedParams.id}`;
    const loginHref = `/auth/login?next=${encodeURIComponent(adPath)}`;
    const publishedAt = ad.date_publication
        ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(ad.date_publication))
        : "Date inconnue";

    let sellerContactPanel = (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Contacter le vendeur</h2>
            <p className="mt-2 text-sm text-zinc-700">
                Connectez-vous pour envoyer un message au vendeur.
            </p>
            <Link href={loginHref} className="mt-3 inline-block text-sm font-medium text-zinc-900 underline">
                Se connecter
            </Link>
        </div>
    );

    if (isOwner) {
        sellerContactPanel = (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                Cette annonce vous appartient. Vous pouvez la modifier ou la supprimer depuis cette page.
            </div>
        );
    } else if (canContactSeller) {
        sellerContactPanel = <ContactSellerForm adId={ad.id} sellerId={ad.utilisateur_id} sellerName={ad.vendeur_nom} />;
    }

    return (
        <main className="mx-auto w-full max-w-3xl p-6">
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                                {ad.categorie_nom || `Categorie ${ad.categorie_id}`}
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{ad.titre}</h1>
                        </div>
                        <p className="text-3xl font-semibold text-zinc-950">{ad.prix} EUR</p>
                    </div>

                    <dl className="mb-6 grid gap-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700 md:grid-cols-3">
                        <div>
                            <dt className="font-medium text-zinc-900">Localisation</dt>
                            <dd>{ad.localisation}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-zinc-900">Publication</dt>
                            <dd>{publishedAt}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-zinc-900">Vendeur</dt>
                            <dd>{ad.vendeur_nom}</dd>
                        </div>
                    </dl>

                    {Array.isArray(ad.images) && ad.images.length > 0 ? (
                        <section aria-label="Galerie images" className="mb-6 grid gap-3 sm:grid-cols-2">
                            {ad.images.map((image, index) => (
                                <Image
                                    key={image.id || image.url}
                                    src={image.url}
                                    alt={`Annonce ${ad.titre} ${index + 1}`}
                                    width={960}
                                    height={448}
                                    className="h-56 w-full rounded-xl border border-zinc-200 object-cover"
                                    unoptimized
                                />
                            ))}
                        </section>
                    ) : null}

                    <div className="prose max-w-none text-zinc-800">
                        <p>{ad.description}</p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        {isOwner ? (
                            <>
                                <Link href={`/ads/edit/${resolvedParams.id}`} className="rounded-md bg-black px-4 py-2 text-sm text-white">
                                    Modifier
                                </Link>
                                <DeleteAdButton adId={resolvedParams.id} />
                            </>
                        ) : null}
                        <Link href="/ads" className="self-center text-sm text-zinc-700 underline">
                            Retour aux annonces
                        </Link>
                    </div>
                </article>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold text-zinc-950">A propos du vendeur</h2>
                        <p className="mt-2 text-sm text-zinc-700">{ad.vendeur_nom}</p>
                        <p className="mt-1 text-sm text-zinc-600">{ad.vendeur_email}</p>
                    </div>

                    {sellerContactPanel}
                </aside>
            </div>
        </main>
    );
}
