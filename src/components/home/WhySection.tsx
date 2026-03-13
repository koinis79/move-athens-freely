import { MapPin, ShieldCheck, Truck, Headset } from "lucide-react";
import { useTranslation } from "react-i18next";

const WhySection = () => {
  const { t } = useTranslation();

  const features = [
    { Icon: MapPin, title: t("whySection.athensBased"), desc: t("whySection.athensBasedDesc") },
    { Icon: ShieldCheck, title: t("whySection.qualityGuaranteed"), desc: t("whySection.qualityGuaranteedDesc") },
    { Icon: Truck, title: t("whySection.hotelDelivery"), desc: t("whySection.hotelDeliveryDesc") },
    { Icon: Headset, title: t("whySection.support"), desc: t("whySection.supportDesc") },
  ];

  return (
    <section className="bg-primary/5 py-16 md:py-20">
      <div className="container">
        <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
          {t("whySection.title")}
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-heading font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;
