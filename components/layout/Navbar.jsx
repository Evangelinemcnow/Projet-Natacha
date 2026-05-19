import Link from "next/link";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import LogoutButton from "@/components/layout/LogoutButton";

export default async function Navbar() {
    const authUser = await getAuthenticatedUserFromCookies();

    return (
        <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 p-4">
                <Link href="/" className="text-lg font-semibold text-zinc-900">
                    Leboncoincoin
                </Link>

                <div className="flex items-center gap-4 text-sm text-zinc-700">
                    <Link href="/ads">Annonces</Link>
                    <Link href="/ads/create">Deposer</Link>
                    {authUser?.id ? (
                        <>
                            <Link href="/profile">Profil</Link>
                            <LogoutButton />
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login">Connexion</Link>
                            <Link href="/auth/register">Inscription</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
