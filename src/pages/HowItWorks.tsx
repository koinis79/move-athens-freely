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
  ArrowRight,
} from "lucide-react";

/* ── Timeline steps ─────────────────────────────────────── */
const steps = [
  {
    num: 1,
    Icon: Search,
    title: "Browse & Choose",
    desc: "Explore our range of wheelchairs, scooters, and rollators. Filter by type, compare specifications, and find the perfect fit for your needs.",
  },
  {
    num: 2,
    Icon: CalendarDays,
    title: "Select Your Dates",
    desc: "Choose your rental start and end dates. Need it for a day, a week, or a month? We have flexible pricing for every duration.",
  },
  {
    num: 3,
    Icon: CreditCard,
    title: "Book & Pay Online",
    desc: "Enter your hotel details, select your delivery zone, and pay securely via Stripe. You'll receive an instant confirmation email.",
  },
  {
    num: 4,
    Icon: Truck,
    title: "We Deliver to Your Door",
    desc: "Our team delivers your sanitized equipment directly to your hotel or accommodation. We'll meet you at reception and show you how everything works.",
  },
  {
    num: 5,
    Icon: Smile,
    title: "Enjoy Athens",
    desc: "Explore the Acropolis, dine in Plaka, stroll along the coast. When your rental ends, we pick up the equipment from your accommodation. That's it.",
  },
];

/* ── Pricing cards ──────────────────────────────────────── */
const pricingCards = [
  { label: "Daily", price: "€5", unit: "day", note: "Best for short visits" },
  { label: "Weekly", price: "€30", unit: "week", note: "Save up to 14%" },
  { label: "Monthly", price: "€100", unit: "month", note: "Save up to 33%" },
];

/* ── Delivery zones ─────────────────────────────────────── */
const zones = [
  {
    name: "Athens City Center",
    areas: "Plaka, Monastiraki, Syntagma, Kolonaki",
    fee: "Free delivery",
    highlight: true,
  },
  {
    name: "Greater Athens",
    areas: "Kifisia, Glyfada, Marousi, Piraeus",
    fee: "€15",
    highlight: false,
  },
  {
    name: "Piraeus Port",
    areas: "Cruise terminals & port area",
    fee: "€20",
    highlight: false,
  },
  {
    name: "Athens Airport",
    areas: "Eleftherios Venizelos",
    fee: "€25",
    highlight: false,
  },
];

/* ── FAQ items ──────────────────────────────────────────── */
const faqs = [
  {
    q: "Do I need to leave a deposit?",
    a: "Yes — a small refundable deposit is required at the time of booking. It is returned in full once the equipment is picked up in good condition.",
  },
  {
    q: "Can I extend my rental period?",
    a: "Absolutely. Contact us at least 24 hours before your rental ends and we'll extend it — subject to availability.",
  },
  {
    q: "Is the equipment sanitized?",
    a: "Every item is professionally sanitized and safety-checked between rentals. We follow strict hygiene protocols.",
  },
  {
    q: "What if the equipment breaks during my rental?",
    a: "All equipment is covered by our rental insurance. Contact us immediately and we'll arrange a replacement at no extra cost.",
  },
];

/* ════════════════════════════════════════════════════════ */

const HowItWorks = () => (
  <>
    {/* ── Hero ──────────────────────────────────────────── */}
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-28">
      <div className="container relative z-10 flex flex-col items-center text-center">
        <h1 className="max-w-3xl text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          How Moveability Works
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Renting mobility equipment in Athens is simple. Here's how it works in
          5&nbsp;easy steps.
        </p>
      </div>
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
    </section>

    {/* ── Timeline steps ────────────────────────────────── */}
    <section className="bg-background py-16 md:py-24">
      <div className="container max-w-4xl">
        <div className="relative">
          {/* vertical line — desktop only */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block" />

          <div className="flex flex-col gap-12 md:gap-16">
            {steps.map(({ num, Icon, title, desc }, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={num}
                  className="relative flex flex-col items-center md:flex-row"
                >
                  {/* Desktop: left or right content */}
                  <div
                    className={`hidden w-5/12 md:block ${
                      isLeft ? "pr-10 text-right" : "order-3 pl-10 text-left"
                    }`}
                  >
                    <Card className="border-none bg-muted/50 shadow-none">
                      <CardContent className="p-6">
                        <Icon className="mb-3 inline-block h-7 w-7 text-primary" />
                        <h3 className="text-xl font-heading font-semibold text-foreground">
                          {title}
                        </h3>
                        <p className="mt-2 text-muted-foreground">{desc}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Center node */}
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-md md:order-2">
                    {num}
                  </div>

                  {/* spacer on opposite side */}
                  <div
                    className={`hidden w-5/12 md:block ${
                      isLeft ? "order-3" : ""
                    }`}
                  />

                  {/* Mobile card */}
                  <Card className="mt-4 w-full border-none bg-muted/50 shadow-none md:hidden">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <Icon className="mb-3 h-7 w-7 text-primary" />
                      <h3 className="text-xl font-heading font-semibold text-foreground">
                        {title}
                      </h3>
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

    {/* ── Pricing ───────────────────────────────────────── */}
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="container">
        <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
          Transparent Pricing
        </h2>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
          {pricingCards.map((c) => (
            <Card
              key={c.label}
              className="border border-border bg-card text-center shadow-sm"
            >
              <CardContent className="flex flex-col items-center p-8">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {c.label}
                </span>
                <p className="mt-3 text-4xl font-heading font-extrabold text-foreground">
                  {c.price}
                  <span className="text-lg font-medium text-muted-foreground">
                    /{c.unit}
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{c.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
          All prices include sanitization, safety checks, and equipment
          insurance. Delivery fees vary by zone.
        </p>
      </div>
    </section>

    {/* ── Delivery zones ────────────────────────────────── */}
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
          Delivery Zones
        </h2>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {zones.map((z) => (
            <Card
              key={z.name}
              className={`border text-center shadow-sm ${
                z.highlight
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <CardContent className="flex flex-col items-center p-6">
                <MapPin
                  className={`h-7 w-7 ${
                    z.highlight ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <h3 className="mt-3 text-lg font-heading font-semibold text-foreground">
                  {z.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{z.areas}</p>
                <span
                  className={`mt-4 inline-block rounded-full px-4 py-1 text-sm font-semibold ${
                    z.highlight
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {z.fee}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
          Pickup is included at no extra charge for all zones.
        </p>
      </div>
    </section>

    {/* ── FAQ preview ───────────────────────────────────── */}
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="container max-w-2xl">
        <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium text-foreground">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 text-center">
          <Button asChild variant="link" className="gap-1">
            <Link to="/faq">
              View all FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>

    {/* ── Bottom CTA ────────────────────────────────────── */}
    <section className="bg-primary py-16 md:py-20">
      <div className="container flex flex-col items-center text-center">
        <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">
          Ready to book?
        </h2>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="mt-8 rounded-xl px-8 text-base font-semibold"
        >
          <Link to="/equipment">Browse Equipment</Link>
        </Button>
      </div>
    </section>
  </>
);

export default HowItWorks;
