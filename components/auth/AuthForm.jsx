"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AuthForm({ mode = "login", nextPath = "/ads" }) {
    const router = useRouter();
    const isRegister = mode === "register";
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [status, setStatus] = useState({
        submitting: false,
        message: "",
        errors: [],
    });

    function handleChange(event) {
        setForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setStatus({ submitting: true, message: "", errors: [] });

        const payload = {
            email: form.email,
            password: form.password,
        };

        if (isRegister) {
            payload.name = form.name;
        }

        try {
            const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                setStatus({
                    submitting: false,
                    message: result.message || "Une erreur est survenue.",
                    errors: Array.isArray(result.errors) ? result.errors : [],
                });
                return;
            }

            router.push(nextPath || "/ads");
            router.refresh();
        } catch {
            setStatus({
                submitting: false,
                message: "Impossible de contacter le serveur.",
                errors: [],
            });
        }
    }

    return (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister ? (
                    <label className="block space-y-1 text-sm text-zinc-700">
                        <span className="font-medium text-zinc-900">Nom</span>
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Votre nom"
                            required
                        />
                    </label>
                ) : null}

                <label className="block space-y-1 text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Email</span>
                    <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="nom@exemple.fr"
                        required
                    />
                </label>

                <label className="block space-y-1 text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Mot de passe</span>
                    <Input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 caracteres"
                        required
                    />
                </label>

                {status.message ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        <p>{status.message}</p>
                        {status.errors.length > 0 ? (
                            <ul className="mt-2 list-disc pl-5">
                                {status.errors.map((error) => (
                                    <li key={error}>{error}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                ) : null}

                <Button type="submit" disabled={status.submitting} className="w-full justify-center">
                    {status.submitting
                        ? isRegister
                            ? "Creation du compte..."
                            : "Connexion..."
                        : isRegister
                            ? "Creer mon compte"
                            : "Se connecter"}
                </Button>
            </form>

            <p className="mt-4 text-sm text-zinc-600">
                {isRegister ? "Vous avez deja un compte ? " : "Pas encore de compte ? "}
                <Link
                    href={`${isRegister ? "/auth/login" : "/auth/register"}${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
                    className="font-medium text-zinc-900 underline"
                >
                    {isRegister ? "Se connecter" : "Creer un compte"}
                </Link>
            </p>
        </div>
    );
}