"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function DeleteAdButton({ adId }) {
    const router = useRouter();
    const [status, setStatus] = useState({
        submitting: false,
        message: "",
    });

    async function handleDelete() {
        const confirmed = window.confirm("Supprimer definitivement cette annonce ?");

        if (!confirmed) {
            return;
        }

        setStatus({ submitting: true, message: "" });

        try {
            const response = await fetch(`/api/ads/${adId}`, {
                method: "DELETE",
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                setStatus({
                    submitting: false,
                    message: result.message || "Suppression impossible.",
                });
                return;
            }

            router.push("/ads");
            router.refresh();
        } catch {
            setStatus({
                submitting: false,
                message: "Le serveur ne repond pas pour le moment.",
            });
        }
    }

    return (
        <div className="space-y-2">
            <Button type="button" className="bg-red-600 hover:bg-red-700" disabled={status.submitting} onClick={handleDelete}>
                {status.submitting ? "Suppression..." : "Supprimer"}
            </Button>
            {status.message ? <p className="text-sm text-red-700">{status.message}</p> : null}
        </div>
    );
}