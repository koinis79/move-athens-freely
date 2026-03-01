import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { equipmentItems, categoryFilterLabels } from "@/data/equipment";
import {
  equipmentDetailsMap,
  defaultDetails,
} from "@/data/equipmentSpecs";
import ImageGallery from "@/components/equipment/ImageGallery";
import BookingPanel from "@/components/equipment/BookingPanel";
import SpecificationsSection from "@/components/equipment/SpecificationsSection";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import NotFound from "./NotFound";

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
};

const EquipmentDetail = () => {
  const { categorySlug, slug } = useParams();

  const item = equipmentItems.find((i) => i.slug === slug);
  if (!item) return <NotFound />;

  const details = equipmentDetailsMap[item.slug] ?? {
    ...defaultDetails,
    pricePerMonth: Math.round(item.pricePerDay * 30 * 0.67),
  };

  const categoryLabel =
    categoryFilterLabels.find((c) => c.slug === item.categorySlug)?.label ??
    item.category;

  // Related items: same category first, then others, exclude current
  const related = equipmentItems
    .filter((i) => i.id !== item.id)
    .sort((a, b) =>
      a.categorySlug === item.categorySlug
        ? -1
        : b.categorySlug === item.categorySlug
        ? 1
        : 0
    )
    .slice(0, 3);

  return (
    <div className="container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-sm text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li>
            <Link
              to="/equipment"
              className="hover:text-primary transition-colors"
            >
              Equipment
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li>
            <Link
              to={`/equipment/${item.categorySlug}`}
              className="hover:text-primary transition-colors"
            >
              {categoryLabel}
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li className="text-foreground font-medium">{item.name}</li>
        </ol>
      </nav>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        {/* Left — Image gallery */}
        <ImageGallery images={details.images} alt={item.name} />

        {/* Right — Info + Booking */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={`text-xs font-semibold ${categoryColors[item.category] ?? ""}`}
            >
              {item.category}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${availabilityStyles[item.availability]}`}
            >
              {item.availability}
            </Badge>
          </div>

          <h1 className="text-2xl font-heading font-bold text-foreground md:text-3xl">
            {item.name}
          </h1>

          <p className="text-muted-foreground leading-relaxed">
            {details.longDescription}
          </p>

          <BookingPanel item={item} details={details} />
        </div>
      </div>

      {/* Specifications */}
      <div className="mt-12 md:mt-16">
        <SpecificationsSection specs={details.specs} />
      </div>

      {/* What's Included */}
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">
          What's Included
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {details.included.map((text) => (
            <li key={text} className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
              {text}
            </li>
          ))}
        </ul>
      </section>

      {/* Related Equipment */}
      <section className="mt-12 md:mt-16 space-y-6">
        <h2 className="text-2xl font-heading font-bold text-foreground">
          You might also need
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <EquipmentCard key={r.id} item={r} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default EquipmentDetail;
