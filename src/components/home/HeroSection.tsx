import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const HERO_IMG =
  "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/hero-wheelchair-acropolis.png.png";

const HeroSection = () => {
  const { t } = useTranslation();

  const trustItems = [
    t("hero.trustFreeDelivery"),
    t("hero.trustSanitized"),
    t("hero.trustSupport"),
  ];

  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      {/* Background image */}
      <img
        src={HERO_IMG}
        alt="Wheelchair traveler enjoying the view of the Acropolis in Athens"
        className="absolute inset-0 h-full w-full object-cover object-right-center"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="container relative z-10 flex min-h-[70vh] flex-col items-center justify-center py-20 text-center md:py-28 lg:py-32">
        <h1 className="max-w-3xl text-4xl font-heading font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl [text-shadow:_0_2px_12px_rgb(0_0_0_/_50%)]">
          {t("hero.title")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl [text-shadow:_0_1px_6px_rgb(0_0_0_/_40%)]">
          {t("hero.subtitle")}
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-xl px-8 text-base font-semibold">
            <Link to="/equipment">{t("hero.browseEquipment")}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl border-white/40 px-8 text-base font-semibold text-white hover:bg-white/10"
          >
            <Link to="/how-it-works">{t("hero.howItWorks")}</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/85">
          {trustItems.map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-accent" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
