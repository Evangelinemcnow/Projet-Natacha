"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    async function handleLogout() {
        setSubmitting(true);

        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } finally {
            router.push("/");
            router.refresh();
            setSubmitting(false);
        }
    }

    return (
        <button type="button" onClick={handleLogout} disabled={submitting} className="text-sm text-zinc-700 underline disabled:opacity-60">
            {submitting ? "Deconnexion..." : "Deconnexion"}
        </button>
    );
}