import Link from "next/link";
import AdList from "@/components/ads/AdList";
import { searchAds } from "@/lib/services/ad.service";

export default async function Home() {
    let latestAds = [];
    let hasCatalogError = false;

    try {
        latestAds = (await searchAds({})).slice(0, 4);
    } catch {
        hasCatalogError = true;
    }

    return (
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
            <section className="rounded-4xl bg-zinc-950 px-8 py-12 text-white shadow-xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-300">Projet pedagogique</p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                    Achetez, vendez et contactez facilement autour de vous.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
                    Leboncoincoin centralise les annonces, la recherche multicritere et les parcours utilisateur essentiels d&apos;une plateforme de petites annonces.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/ads" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950">
                        Parcourir les annonces
                    </Link>
                    <Link href="/ads/create" className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white">
                        Deposer une annonce
                    </Link>
                </div>
            </section>

            <section className="mt-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-zinc-950">Dernieres annonces</h2>
                        <p className="mt-1 text-sm text-zinc-600">Apercu du catalogue disponible sur la plateforme.</p>
                    </div>
                    <Link href="/ads" className="text-sm font-medium text-zinc-900 underline">
                        Voir tout
                    </Link>
                </div>

                {hasCatalogError ? (
                    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Les annonces ne sont pas accessibles pour le moment. Verifiez la connexion a la base de donnees puis rechargez la page.
                    </div>
                ) : null}

                <AdList ads={latestAds} />
            </section>
        </main>
    );
}
