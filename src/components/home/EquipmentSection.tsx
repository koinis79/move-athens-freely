import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

import wheelchairsImg from "@/assets/categories/wheelchairs.jpg";
import powerWheelchairsImg from "@/assets/categories/power-wheelchairs.jpg";
import mobilityScootersImg from "@/assets/categories/mobility-scooters.jpg";
import rollatorsImg from "@/assets/categories/rollators.jpg";

const EquipmentSection = () => {
  const { t } = useTranslation();

  const categories = [
    { titleKey: "equipmentSection.manualWheelchairs", price: "10", slug: "wheelchairs", image: wheelchairsImg },
    { titleKey: "equipmentSection.powerWheelchairs", price: "35", slug: "power-wheelchairs", image: powerWheelchairsImg },
    { titleKey: "equipmentSection.mobilityScooters", price: "25", slug: "mobility-scooters", image: mobilityScootersImg },
    { titleKey: "equipmentSection.rollatorsWalkers", price: "5", slug: "rollators-walkers", image: rollatorsImg },
  ];

  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="container">
        <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
          {t("equipmentSection.title")}
        </h2>

        <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ titleKey, price, slug, image }) => (
            <Link key={slug} to={`/equipment/${slug}`} className="group">
              <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                  <img src={image} alt={t(titleKey)} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t(titleKey)}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-secondary">
                    {t("equipmentSection.fromPrice", { price })}
                  </p>
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
