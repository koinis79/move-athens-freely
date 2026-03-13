import { Search, CalendarDays, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    { num: 1, Icon: Search, title: t("howItWorksSection.step1Title"), desc: t("howItWorksSection.step1Desc") },
    { num: 2, Icon: CalendarDays, title: t("howItWorksSection.step2Title"), desc: t("howItWorksSection.step2Desc") },
    { num: 3, Icon: Truck, title: t("howItWorksSection.step3Title"), desc: t("howItWorksSection.step3Desc") },
  ];

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container">
        <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
          {t("howItWorksSection.title")}
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ num, Icon, title, desc }) => (
            <Card key={num} className="border-none bg-muted/50 text-center shadow-none">
              <CardContent className="flex flex-col items-center p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {num}
                </span>
                <Icon className="mt-5 h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-heading font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
