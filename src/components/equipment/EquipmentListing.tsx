import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import EquipmentCard from "./EquipmentCard";
import EquipmentCardSkeleton from "./EquipmentCardSkeleton";
import { categoryFilterLabels } from "@/data/equipment";
import { useEquipment } from "@/hooks/useEquipment";

type SortOption = "price-asc" | "price-desc" | "popular";

interface Props {
  categorySlug?: string;
}

const categoryHeroImages: Record<string, { src: string; alt: string }> = {
  wheelchairs: {
    src: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/manual_wheelchair_plaka_1773960710836.png",
    alt: "Woman in wheelchair enjoying Plaka with Acropolis view",
  },
  "power-wheelchairs": {
    src: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/electric_wheelchair_riviera_1773960744195.png",
    alt: "Electric wheelchair at Athens Riviera coastline",
  },
  rollators: {
    src: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/realistic_rollator_athens_1773961139410.png",
    alt: "Rollator on Athens street",
  },
  "mobility-scooters": {
    src: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/scooter-street.png",
    alt: "Smiling elderly woman on a red mobility scooter on Ermou Street in Athens",
  },
};

const EquipmentListing = ({ categorySlug }: Props) => {
  const [activeFilter, setActiveFilter] = useState(categorySlug ?? "");
  const [sort, setSort] = useState<SortOption>("popular");
  const { t } = useTranslation();

  const effectiveSlug = categorySlug ?? (activeFilter || undefined);
  const { items, loading, error } = useEquipment(effectiveSlug);

  const sorted = useMemo(() => {
    const copy = [...items];
    switch (sort) {
      case "price-asc":
        copy.sort((a, b) => a.priceTier1 - b.priceTier1);
        break;
      case "price-desc":
        copy.sort((a, b) => b.priceTier1 - a.priceTier1);
        break;
      case "popular":
        copy.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        break;
    }
    return copy;
  }, [items, sort]);

  const heading = categorySlug
    ? categoryFilterLabels.find((c) => c.slug === categorySlug)?.label ?? t("nav.equipment")
    : t("equipmentListing.title");

  const hero = categorySlug ? (categoryHeroImages[categorySlug] ?? null) : null;

  return (
    <>
      <div className="container py-10 md:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">{t("equipmentListing.home")}</Link>
            </li>
            <li aria-hidden="true">&gt;</li>
            {categorySlug ? (
              <>
                <li>
                  <Link to="/equipment" className="hover:text-primary transition-colors">{t("nav.equipment")}</Link>
                </li>
                <li aria-hidden="true">&gt;</li>
                <li className="text-foreground font-medium">
                  {categoryFilterLabels.find((c) => c.slug === categorySlug)?.label}
                </li>
              </>
            ) : (
              <li className="text-foreground font-medium">{t("nav.equipment")}</li>
            )}
          </ol>
        </nav>

        {/* Heading row — decorative image floats right on md+ screens */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-foreground md:text-4xl">{heading}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("equipmentListing.subtitle")}</p>
          </div>
          {hero && (
            <div className="hidden md:block shrink-0">
              <img
                src={hero.src}
                alt={hero.alt}
                className="w-64 max-w-[280px] rounded-xl object-cover shadow-md"
                loading="eager"
              />
            </div>
          )}
        </div>
        {/* Mobile: show image centered below heading */}
        {hero && (
          <div className="mt-4 flex justify-center md:hidden">
            <img
              src={hero.src}
              alt={hero.alt}
              className="w-40 rounded-xl object-cover shadow-md"
              loading="eager"
            />
          </div>
        )}

        {/* Filter + Sort bar */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {!categorySlug && (
            <div className="flex flex-wrap gap-2">
              {categoryFilterLabels.map(({ label, slug }) => (
                <Button
                  key={slug}
                  variant={activeFilter === slug ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setActiveFilter(slug)}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-52 rounded-xl">
              <SelectValue placeholder={t("equipmentListing.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">{t("equipmentListing.sortPopular")}</SelectItem>
              <SelectItem value="price-asc">{t("equipmentListing.sortPriceAsc")}</SelectItem>
              <SelectItem value="price-desc">{t("equipmentListing.sortPriceDesc")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
            <p className="font-semibold">{t("equipmentListing.failedToLoad")}</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <EquipmentCardSkeleton key={i} />)
            : sorted.map((item) => <EquipmentCard key={item.id} item={item} />)}
        </div>

        {!loading && !error && sorted.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">{t("equipmentListing.noEquipment")}</p>
        )}

        <section className="mt-16 rounded-xl bg-muted/50 p-8 text-center md:p-12">
          <h2 className="text-2xl font-heading font-bold text-foreground">{t("equipmentListing.needHelp")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">{t("equipmentListing.needHelpDesc")}</p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
              <a href="https://wa.me/302109511750" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                {t("equipmentListing.chatWhatsApp")}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link to="/contact">{t("equipmentListing.contactUs")}</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default EquipmentListing;
