import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const categories = [
  {
    titleKey: "equipmentSection.manualWheelchairs",
    price: "49",
    slug: "wheelchairs",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/wheelchair-rental-plaka-athens.png",
    alt: "Wheelchair rental in Plaka, Athens - elderly woman exploring with caregiver",
    objectPosition: "object-top",
    guideText: "Perfect for visiting the Acropolis",
    guideHref: "/accessible-athens/acropolis-wheelchair-guide",
  },
  {
    titleKey: "equipmentSection.mobilityScooters",
    price: "120",
    slug: "mobility-scooters",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/mobility-scooter-acropolis-athens.png",
    alt: "Mobility scooter rental near Acropolis, Athens - tourist exploring independently",
    objectPosition: "object-center",
    guideText: "Great for exploring Athens beaches",
    guideHref: "/accessible-athens/accessible-beaches-athens",
  },
  {
    titleKey: "equipmentSection.rollatorsWalkers",
    price: "49",
    slug: "walking-aids",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/rollator-walker-piraeus-harbor.png",
    alt: "Rollator walker rental at Piraeus harbor, Athens - senior enjoying waterfront",
    objectPosition: "object-center",
    guideText: "Ideal for strolling through Plaka",
    guideHref: "/accessible-athens/accessible-restaurants-bars-athens",
  },
];

const EquipmentSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="container">
        <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
          {t("equipmentSection.title")}
        </h2>

        <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {categories.map(({ titleKey, price, slug, image, alt, objectPosition, guideText, guideHref }) => (
            <Link key={slug} to={`/equipment/${slug}`} className="group">
              <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                  <img src={image} alt={alt || t(titleKey)} className={`h-full w-full object-cover ${objectPosition}`} loading="lazy" />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t(titleKey)}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xs text-muted-foreground">From</span>
                    <span className="text-2xl font-bold text-primary">€{price}</span>
                    <span className="text-sm text-muted-foreground">/day</span>
                  </div>
                  {guideText && (
                    <p className="mt-2 text-xs text-primary hover:underline">
                      {guideText} &rarr;
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EquipmentSection;
