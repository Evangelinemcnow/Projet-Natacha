import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
    title: "Connexion",
    description: "Connexion utilisateur",
};

function normalizeNextPath(value) {
    if (typeof value !== "string" || !value.startsWith("/")) {
        return "/ads";
    }

    return value;
}

export default async function LoginPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const nextPath = normalizeNextPath(resolvedSearchParams?.next);

    return (
        <main className="mx-auto grid min-h-[70vh] w-full max-w-5xl gap-8 px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <section>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Module 6</p>
                <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">Connexion utilisateur</h1>
                <p className="mt-4 max-w-lg text-base leading-7 text-zinc-600">
                    Connectez-vous pour deposer une annonce, modifier vos publications et contacter un vendeur.
                </p>
            </section>

            <AuthForm mode="login" nextPath={nextPath} />
        </main>
    );
}
