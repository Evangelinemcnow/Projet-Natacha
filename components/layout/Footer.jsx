export default function Footer() {
    return (
        <footer className="mt-auto border-t border-zinc-200 bg-white">
            <div className="mx-auto w-full max-w-6xl p-4 text-sm text-zinc-600">
                © {new Date().getFullYear()} Leboncoincoin - Projet pedagogique
            </div>
        </footer>
    );
}
