import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  CalendarDays,
  CreditCard,
  Truck,
  Smile,
  MapPin,
  Hotel,
  Ship,
  Plane,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { num: 1, Icon: Search, title: t("howItWorksPage.step1Title"), desc: t("howItWorksPage.step1Desc") },
    { num: 2, Icon: CalendarDays, title: t("howItWorksPage.step2Title"), desc: t("howItWorksPage.step2Desc") },
    { num: 3, Icon: CreditCard, title: t("howItWorksPage.step3Title"), desc: t("howItWorksPage.step3Desc") },
    { num: 4, Icon: Truck, title: t("howItWorksPage.step4Title"), desc: t("howItWorksPage.step4Desc") },
    { num: 5, Icon: Smile, title: t("howItWorksPage.step5Title"), desc: t("howItWorksPage.step5Desc") },
  ];

  const pricingCards = [
    { label: t("howItWorksPage.1to3days"), items: ["Rollators from €20", "Wheelchairs from €35", "Scooters from €100", "Power Wheelchairs from €150"] },
    { label: t("howItWorksPage.4to7days"), items: ["Rollators from €35", "Wheelchairs from €55", "Scooters from €170", "Power Wheelchairs from €250"] },
    { label: t("howItWorksPage.8to14days"), items: ["Rollators from €55", "Wheelchairs from €80", "Scooters from €280", "Power Wheelchairs from €400"] },
  ];

  const zones = [
    { Icon: Hotel, name: "Hotel — City Center", areas: "Syntagma, Plaka, Monastiraki, Psiri", fee: "€10", note: null },
    { Icon: Hotel, name: "Hotel — Extended Center", areas: "Kallithea, Kolonaki, Pagkrati", fee: "€15", note: null },
    { Icon: Hotel, name: "Hotel — Suburbs & Riviera", areas: "Glyfada, Kifisia, Vouliagmeni", fee: "€20", note: null },
    { Icon: Ship, name: "Piraeus Cruise / Ferry Terminal", areas: "Cruise & ferry port area", fee: "€25", note: t("howItWorksPage.preArranged") },
    { Icon: Plane, name: "Athens Airport (ATH)", areas: "Eleftherios Venizelos", fee: "€30", note: t("howItWorksPage.preArranged") },
  ];

  const faqs = [
    { q: t("howItWorksPage.faq1q"), a: t("howItWorksPage.faq1a") },
    { q: t("howItWorksPage.faq2q"), a: t("howItWorksPage.faq2a") },
    { q: t("howItWorksPage.faq3q"), a: t("howItWorksPage.faq3a") },
    { q: t("howItWorksPage.faq4q"), a: t("howItWorksPage.faq4a") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-28">
        <div className="container relative z-10 flex flex-col items-center text-center">
          <h1 className="max-w-3xl text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {t("howItWorksPage.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("howItWorksPage.subtitle")}
          </p>
        </div>
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      </section>

      {/* Timeline steps */}
      <section className="bg-background py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="relative">
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block" />
            <div className="flex flex-col gap-12 md:gap-16">
              {steps.map(({ num, Icon, title, desc }, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <div key={num} className="relative flex flex-col items-center md:flex-row">
                    <div className={`hidden w-5/12 md:block ${isLeft ? "pr-10 text-right" : "order-3 pl-10 text-left"}`}>
                      <Card className="border-none bg-muted/50 shadow-none">
                        <CardContent className="p-6">
                          <Icon className="mb-3 inline-block h-7 w-7 text-primary" />
                          <h3 className="text-xl font-heading font-semibold text-foreground">{title}</h3>
                          <p className="mt-2 text-muted-foreground">{desc}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-md md:order-2">
                      {num}
                    </div>
                    <div className={`hidden w-5/12 md:block ${isLeft ? "order-3" : ""}`} />
                    <Card className="mt-4 w-full border-none bg-muted/50 shadow-none md:hidden">
                      <CardContent className="flex flex-col items-center p-6 text-center">
                        <Icon className="mb-3 h-7 w-7 text-primary" />
                        <h3 className="text-xl font-heading font-semibold text-foreground">{title}</h3>
                        <p className="mt-2 text-muted-foreground">{desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/40 py-16 md:py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">{t("howItWorksPage.pricingTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">{t("howItWorksPage.pricingSubtitle")}</p>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {pricingCards.map((c) => (
              <Card key={c.label} className="border border-border bg-card shadow-sm">
                <CardContent className="flex flex-col p-8">
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary">{c.label}</span>
                  <ul className="mt-4 space-y-2">
                    {c.items.map((item) => (
                      <li key={item} className="text-sm text-foreground">{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
            {t("howItWorksPage.pricingNote")}{" "}
            <Link to="/equipment" className="font-medium text-primary underline underline-offset-2">
              {t("howItWorksPage.equipmentPage")}
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Delivery zones */}
      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">{t("howItWorksPage.deliveryTitle")}</h2>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {zones.map((z) => (
              <Card key={z.name} className="border border-border bg-card text-center shadow-sm">
                <CardContent className="flex flex-col items-center p-6">
                  <z.Icon className="h-7 w-7 text-muted-foreground" />
                  <h3 className="mt-3 text-base font-heading font-semibold text-foreground">{z.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{z.areas}</p>
                  <span className="mt-4 inline-block rounded-full bg-muted px-4 py-1 text-sm font-semibold text-foreground">{z.fee}</span>
                  {z.note && <span className="mt-1 text-xs italic text-muted-foreground">{z.note}</span>}
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">{t("howItWorksPage.deliveryNote")}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/40 py-16 md:py-24">
        <div className="container max-w-2xl">
          <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">{t("howItWorksPage.faqTitle")}</h2>

          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium text-foreground">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 text-center">
            <Button asChild variant="link" className="gap-1">
              <Link to="/faq">{t("howItWorksPage.viewAllFaqs")} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container flex flex-col items-center text-center">
          <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">{t("howItWorksPage.readyToBook")}</h2>
          <Button asChild size="lg" variant="secondary" className="mt-8 rounded-xl px-8 text-base font-semibold">
            <Link to="/equipment">{t("howItWorksPage.browseEquipment")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default HowItWorks;
