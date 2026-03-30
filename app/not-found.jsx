import Link from "next/link";

export default function NotFound() {
    return (
        <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight">404 - Page introuvable</h1>
            <p className="mt-4 text-base text-gray-600">
                La page demandee n&apos;existe pas ou a ete deplacee.
            </p>
            <Link
                href="/"
                className="mt-8 inline-flex rounded-md bg-black px-4 py-2 text-white hover:opacity-90"
            >
                Retour a l&apos;accueil
            </Link>
        </main>
    );
}
