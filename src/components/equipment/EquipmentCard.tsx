import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import type { EquipmentItem } from "@/data/equipment";

const availabilityStyles: Record<string, string> = {
  Available: "bg-accent/15 text-accent border-accent/30",
  Limited: "bg-secondary/15 text-secondary border-secondary/30",
  Unavailable: "bg-destructive/15 text-destructive border-destructive/30",
};

const categoryColors: Record<string, string> = {
  Wheelchair: "bg-primary/10 text-primary",
  "Power Wheelchair": "bg-primary/10 text-primary",
  "Mobility Scooter": "bg-secondary/10 text-secondary",
  Rollator: "bg-accent/10 text-accent",
  "Walking Aid": "bg-accent/10 text-accent",
};

const categoryEmoji: Record<string, string> = {
  Wheelchair: "♿",
  "Power Wheelchair": "⚡",
  "Mobility Scooter": "🛵",
  Rollator: "🦯",
  "Walking Aid": "🦯",
};

const EquipmentCard = ({ item }: { item: EquipmentItem }) => {
  const { t } = useTranslation();

  return (
    <Link to={`/equipment/${item.categorySlug}/${item.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[3/2] bg-muted flex items-center justify-center">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <span className="text-6xl select-none" aria-hidden="true">{categoryEmoji[item.category] ?? "♿"}</span>
          )}
          <Badge variant="secondary" className={`absolute left-3 top-3 text-xs font-semibold ${categoryColors[item.category] ?? ""}`}>
            {item.category}
          </Badge>
        </div>

        <CardContent className="flex flex-col gap-2 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {item.name}
            </h3>
            <Badge variant="outline" className={`shrink-0 text-xs ${availabilityStyles[item.availability] ?? ""}`}>
              {item.availability}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

          <div className="mt-1">
            <span className="text-lg font-bold text-primary">{t("equipmentListing.from", { price: item.priceTier1 })}</span>
            <span className="ml-2 text-sm text-muted-foreground">{t("equipmentListing.forDays")}</span>
          </div>

          <Button variant="outline" className="mt-2 w-full rounded-xl" tabIndex={-1}>
            {t("equipmentListing.viewDetails")}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EquipmentCard;
