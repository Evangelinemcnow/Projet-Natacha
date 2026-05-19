import { redirect } from "next/navigation";
import AdList from "@/components/ads/AdList";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { listAdsByUser } from "@/lib/services/ad.service";

export const metadata = {
    title: "Mon profil",
    description: "Gestion du profil utilisateur",
};

export default async function ProfilePage() {
    const authUser = await getAuthenticatedUserFromCookies();

    if (!authUser?.id) {
        redirect("/auth/login?next=%2Fprofile");
    }

    let ads = [];
    let dataError = false;

    try {
        ads = await listAdsByUser(authUser.id);
    } catch {
        dataError = true;
    }

    return (
        <main className="mx-auto w-full max-w-3xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">Mon profil</h1>
            <div className="mb-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">Session active</p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-950">{authUser.name}</h2>
                <p className="mt-1 text-sm text-zinc-600">{authUser.email}</p>
            </div>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-950">Mes annonces</h2>
                    <p className="text-sm text-zinc-600">{ads.length} publication{ads.length > 1 ? "s" : ""}</p>
                </div>

                {dataError ? (
                    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Vos annonces ne peuvent pas etre chargees pour le moment. Verifiez la connexion a la base puis reessayez.
                    </div>
                ) : null}

                <AdList ads={ads} />
            </section>
        </main>
    );
}
