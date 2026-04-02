import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin } from "lucide-react";
import { categoryFilterLabels } from "@/data/equipment";
import { useEquipmentDetail, useRelatedEquipment } from "@/hooks/useEquipment";
import ImageGallery from "@/components/equipment/ImageGallery";
import BookingPanel from "@/components/equipment/BookingPanel";
import SpecificationsSection from "@/components/equipment/SpecificationsSection";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import EquipmentCardSkeleton from "@/components/equipment/EquipmentCardSkeleton";
import { Product as ProductSD, BreadcrumbList as BreadcrumbSD } from "@/components/StructuredData";
import NotFound from "./NotFound";

const DEFAULT_INCLUDED = [
  "Professionally sanitized before delivery",
  "Free safety check and demonstration",
  "Delivery & pickup by our team",
  "24/7 emergency support during rental",
  "Equipment insurance included",
];

const availabilityStyles: Record<string, string> = {
  Available: "bg-accent/15 text-accent border-accent/30",
  Limited: "bg-secondary/15 text-secondary border-secondary/30",
  Unavailable: "bg-destructive/15 text-destructive border-destructive/30",
};

const categoryColors: Record<string, string> = {
  Wheelchair: "bg-primary/10 text-primary",
  "Power Wheelchair": "bg-primary/10 text-primary",
  "Mobility Scooter": "bg-secondary/10 text-secondary",
  "Walking Aid": "bg-accent/10 text-accent",
};

const EquipmentDetail = () => {
  const { categorySlug, slug } = useParams();
  const { data, loading, error } = useEquipmentDetail(slug);
  const { related, loading: relatedLoading } = useRelatedEquipment(
    data?.item.categorySlug,
    data?.item.id
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="container py-8 pb-28 md:py-12 md:pb-12">
        <div className="h-4 w-48 mb-6 rounded bg-muted animate-pulse" />
        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-muted">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            </div>
            <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            </div>
            <div className="relative h-64 w-full overflow-hidden rounded-xl bg-muted">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) return <NotFound />;

  const { item, images, specifications, longDescription } = data;

  const categoryLabel =
    categoryFilterLabels.find((c) => c.slug === item.categorySlug)?.label ??
    item.category;

  // ── Spec label, value formatter, and icon mapping ──
  const specLabels: Record<string, string> = {
    foldable: "Foldable",
    wheel_type: "Wheel Type",
    self_propel: "Self-Propel",
    seat_width_cm: "Seat Width",
    product_weight_kg: "Weight",
    weight_capacity_kg: "Weight Capacity",
    max_speed_kmh: "Max Speed",
    range_km: "Range",
    wheels: "Wheels",
    has_seat: "Built-in Seat",
    has_basket: "Storage Basket",
    height_adjustable: "Height Adjustable",
    control: "Control Type",
    battery_type: "Battery",
    airline_approved: "Airline Approved",
  };

  const specIcons: Record<string, string> = {
    foldable: "FoldVertical",
    weight_capacity_kg: "Weight",
    product_weight_kg: "Package",
    seat_width_cm: "Armchair",
    max_speed_kmh: "Gauge",
    range_km: "Battery",
    wheels: "Circle",
    has_seat: "Armchair",
    has_basket: "Package",
    airline_approved: "ShieldCheck",
    control: "Gauge",
    battery_type: "Battery",
    wheel_type: "Circle",
    self_propel: "Footprints",
    height_adjustable: "Ruler",
  };

  const formatSpecValue = (key: string, value: unknown): string => {
    if (value === true) return "Yes";
    if (value === false) return "No";
    if (key.endsWith("_cm")) return `${value} cm`;
    if (key.endsWith("_kg")) return `${value} kg`;
    if (key.endsWith("_kmh")) return `${value} km/h`;
    if (key.endsWith("_km")) return `${value} km`;
    return String(value);
  };

  const specs = Object.entries(specifications).map(([key, value]) => ({
    label: specLabels[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: formatSpecValue(key, value),
    icon: specIcons[key] || "Circle",
  }));

  return (
    <div className="container py-8 pb-28 md:py-12 md:pb-12">
      <ProductSD
        name={item.name}
        description={longDescription || item.description}
        image={Array.isArray(images) && images[0] ? images[0] : undefined}
        price={item.priceTier1}
        availability={item.availability}
        categorySlug={item.categorySlug}
        slug={item.slug}
      />
      <BreadcrumbSD
        items={[
          { name: "Home", href: "/" },
          { name: "Equipment", href: "/equipment" },
          { name: categoryLabel, href: `/equipment/${item.categorySlug}` },
          { name: item.name },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li>
            <Link to="/equipment" className="hover:text-primary transition-colors">
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
        <ImageGallery images={images} alt={item.name} />

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
            {longDescription || item.description}
          </p>

          <BookingPanel item={item} />
        </div>
      </div>

      {/* Specifications */}
      {specs.length > 0 && (
        <div className="mt-12 md:mt-16">
          <SpecificationsSection specs={specs} />
        </div>
      )}

      {/* What's Included */}
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">
          What's Included
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {DEFAULT_INCLUDED.map((text) => (
            <li key={text} className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
              {text}
            </li>
          ))}
        </ul>
      </section>


      {/* Plan Your Trip */}
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground">
          Plan Your Accessible Athens Trip
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            to="/accessible-athens/acropolis-wheelchair-guide"
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Visiting the Acropolis?</p>
              <p className="mt-0.5 text-xs text-primary hover:underline">Read our wheelchair accessibility guide &rarr;</p>
            </div>
          </Link>
          <Link
            to="/accessible-athens/accessible-restaurants-bars-athens"
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Looking for accessible restaurants?</p>
              <p className="mt-0.5 text-xs text-primary hover:underline">See our top 10 picks &rarr;</p>
            </div>
          </Link>
          <Link
            to="/accessible-athens/athens-airport-wheelchair-guide"
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Arriving at the airport?</p>
              <p className="mt-0.5 text-xs text-primary hover:underline">Athens airport accessibility guide &rarr;</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Related Equipment */}
      <section className="mt-12 md:mt-16 space-y-6">
        <h2 className="text-2xl font-heading font-bold text-foreground">
          You might also need
        </h2>
        {relatedLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <EquipmentCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <EquipmentCard key={r.id} item={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EquipmentDetail;
