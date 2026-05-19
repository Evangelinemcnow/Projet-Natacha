"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ContactSellerForm({ adId, sellerId, sellerName }) {
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState({
        submitting: false,
        message: "",
        tone: "idle",
    });

    async function handleSubmit(event) {
        event.preventDefault();
        setStatus({ submitting: true, message: "", tone: "idle" });

        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contenu: message,
                    destinataireId: sellerId,
                    annonceId: adId,
                }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                setStatus({
                    submitting: false,
                    message: result.message || "Message non envoye.",
                    tone: "error",
                });
                return;
            }

            setMessage("");
            setStatus({
                submitting: false,
                message: `Votre message a bien ete envoye a ${sellerName}.`,
                tone: "success",
            });
        } catch {
            setStatus({
                submitting: false,
                message: "Le serveur ne repond pas pour le moment.",
                tone: "error",
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Contacter le vendeur</h2>
            <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                placeholder="Bonjour, votre annonce est-elle toujours disponible ?"
                required
            />
            {status.message ? (
                <p className={`text-sm ${status.tone === "success" ? "text-green-700" : "text-red-700"}`}>{status.message}</p>
            ) : null}
            <Button type="submit" disabled={status.submitting}>
                {status.submitting ? "Envoi..." : "Envoyer le message"}
            </Button>
        </form>
    );
}