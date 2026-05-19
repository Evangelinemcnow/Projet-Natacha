"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdForm from "@/components/ads/AdForm";

export default function AdEditor({
    initialValues,
    categories = [],
    endpoint,
    method = "POST",
    submitLabel,
    successHref,
}) {
    const router = useRouter();
    const [status, setStatus] = useState({
        submitting: false,
        message: "",
        tone: "idle",
    });

    async function handleSubmit(formValues) {
        setStatus({ submitting: true, message: "", tone: "idle" });

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formValues),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                setStatus({
                    submitting: false,
                    message: result.message || "Impossible d'enregistrer l'annonce.",
                    tone: "error",
                });
                return;
            }

            const targetHref = successHref || `/ads/${result.data?.id}`;
            router.push(targetHref);
            router.refresh();
        } catch {
            setStatus({
                submitting: false,
                message: "Le serveur ne repond pas pour le moment.",
                tone: "error",
            });
        }
    }

    return (
        <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            {status.message ? (
                <div
                    className={`rounded-md px-3 py-2 text-sm ${status.tone === "error"
                            ? "border border-red-200 bg-red-50 text-red-700"
                            : "border border-green-200 bg-green-50 text-green-700"
                        }`}
                >
                    {status.message}
                </div>
            ) : null}

            <AdForm
                initialValues={initialValues}
                categories={categories}
                onSubmit={handleSubmit}
                submitLabel={submitLabel}
                submitting={status.submitting}
            />
        </div>
    );
}