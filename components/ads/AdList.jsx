import AdCard from "@/components/ads/AdCard";

export default function AdList({ ads = [] }) {
    if (ads.length === 0) {
        return <p className="rounded-md border border-zinc-200 p-4 text-zinc-700">Aucune annonce disponible.</p>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
            ))}
        </div>
    );
}
