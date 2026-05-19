import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default function AdCard({ ad }) {
    if (!ad) {
        return null;
    }

    return (
        <Card>
            {ad.imagePrincipale ? (
                <Image
                    src={ad.imagePrincipale}
                    alt={`Annonce ${ad.titre}`}
                    width={640}
                    height={320}
                    className="mb-3 h-40 w-full rounded-md object-cover"
                    unoptimized
                />
            ) : null}
            <h3 className="mb-2 text-lg font-semibold text-zinc-900">{ad.titre}</h3>
            <p className="mb-3 line-clamp-2 text-sm text-zinc-700">{ad.description}</p>
            <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-900">{ad.prix} EUR</span>
                <span className="text-zinc-600">{ad.localisation}</span>
            </div>
            <Link href={`/ads/${ad.id}`} className="text-sm text-zinc-700 underline">
                Voir le detail
            </Link>
        </Card>
    );
}
