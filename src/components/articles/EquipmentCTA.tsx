import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getEquipmentMeta } from "@/data/equipmentCatalog";

interface Props {
  equipmentSlug: string;
  context?: string;
}

export default function EquipmentCTA({ equipmentSlug, context }: Props) {
  const eq = getEquipmentMeta(equipmentSlug);
  if (!eq) return null;
  const href = `/equipment/${eq.categorySlug}/${eq.slug}`;

  return (
    <Link
      to={href}
      className="not-prose flex items-stretch gap-4 rounded-2xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-900/40 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md no-underline"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 h-24 w-24 rounded-xl bg-white dark:bg-card border border-blue-100 dark:border-blue-900/40 flex items-center justify-center overflow-hidden">
        <img
          src={eq.image}
          alt={eq.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {context && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1">
            {context}
          </p>
        )}
        <p className="font-semibold text-foreground leading-tight">{eq.name}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{eq.shortDesc}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-primary">
            From €{eq.price}<span className="text-xs font-medium text-muted-foreground">/day</span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Rent Now <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
