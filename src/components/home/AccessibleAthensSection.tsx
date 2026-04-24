import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

import acropolisImg from "@/assets/guides/acropolis.jpg";
import restaurantsImg from "@/assets/guides/restaurants.jpg";
import airportImg from "@/assets/guides/airport-transfer.jpg";

const AccessibleAthensSection = () => {
  const { t } = useTranslation();

  const guides = [
    { titleKey: "accessibleAthensSection.acropolisTitle", excerptKey: "accessibleAthensSection.acropolisExcerpt", slug: "acropolis-wheelchair-guide", image: acropolisImg },
    { titleKey: "accessibleAthensSection.restaurantsTitle", excerptKey: "accessibleAthensSection.restaurantsExcerpt", slug: "restaurants", image: restaurantsImg },
    { titleKey: "accessibleAthensSection.airportTitle", excerptKey: "accessibleAthensSection.airportExcerpt", slug: "athens-airport-wheelchair-guide", image: airportImg },
  ];

  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="container">
        <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
          {t("accessibleAthensSection.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          {t("accessibleAthensSection.subtitle")}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map(({ titleKey, excerptKey, slug, image }) => (
            <Link key={slug} to={`/accessible-athens/${slug}`} className="group">
              <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg h-full">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <img src={image} alt={t(titleKey)} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t(titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{t(excerptKey)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {t("accessibleAthensSection.readGuide")} <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccessibleAthensSection;
