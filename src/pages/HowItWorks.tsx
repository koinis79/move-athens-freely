import { useEffect, useRef } from "react";
import SEOHead from "@/components/SEOHead";
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
  Ship,
  Plane,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Scroll-reveal hook                                                 */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-6");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const steps = [
  { num: 1, Icon: Search, title: "Browse & Choose", desc: "Explore our range of wheelchairs, scooters, and rollators" },
  { num: 2, Icon: CalendarDays, title: "Select Your Dates", desc: "Pick your rental start and end dates" },
  { num: 3, Icon: CreditCard, title: "Book & Pay Online", desc: "Enter your hotel details and pay securely via Stripe" },
  { num: 4, Icon: Truck, title: "We Deliver", desc: "Equipment arrives at your hotel, sanitized and ready" },
  { num: 5, Icon: Smile, title: "Enjoy Athens", desc: "Explore freely, we pick up when you're done" },
];

const zones = [
  {
    Icon: MapPin,
    name: "Athens City Center",
    areas: "Plaka, Syntagma, Monastiraki, Kolonaki",
    fee: "FREE",
    color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  {
    Icon: MapPin,
    name: "Greater Athens",
    areas: "Kifisia, Glyfada, Marousi, Piraeus suburbs",
    fee: "€15",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    Icon: Ship,
    name: "Piraeus Port",
    areas: "Cruise terminal & ferry port",
    fee: "€20",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    Icon: Plane,
    name: "Athens Airport",
    areas: "Eleftherios Venizelos (ATH)",
    fee: "€25",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
];

const faqs = [
  { q: "How far in advance should I book?", a: "We recommend 48 hours, but same-day delivery is often available." },
  { q: "What payment methods do you accept?", a: "All major credit cards via Stripe (Visa, Mastercard, Amex, Apple Pay, Google Pay)." },
  { q: "Can I modify or cancel my booking?", a: "Free cancellation up to 48 hours before delivery. Contact us to modify." },
  { q: "Do you deliver to Airbnbs and cruise ships?", a: "Yes! We deliver to any accommodation in Athens, including Airbnbs, hotels, and cruise terminals." },
  { q: "What if the equipment doesn't work?", a: "Contact us immediately — we'll replace it within hours at no extra charge." },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const HowItWorks = () => (
  <>
    <SEOHead
      title="How It Works – Rent Mobility Equipment in Athens | Movability"
      description="Book online, we deliver to your hotel, enjoy Athens, we pick up. Simple wheelchair & scooter rental in 5 easy steps."
    />

    {/* ── Hero ── */}
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-28">
      <div className="container relative z-10 flex flex-col items-center text-center">
        <h1 className="max-w-3xl text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Renting Made Simple
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          From browsing to exploring Athens — five easy steps, zero hassle.
        </p>
      </div>
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
    </section>

    {/* ── Timeline Steps ── */}
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <Reveal>
          <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
        </Reveal>

        {/* Desktop: horizontal timeline */}
        <div className="relative mt-16 hidden md:block">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-6 h-0.5 border-t-2 border-dashed border-primary/30" />

          <div className="grid grid-cols-5 gap-4">
            {steps.map(({ num, Icon, title, desc }, i) => (
              <Reveal key={num} className="flex flex-col items-center text-center" style-delay>
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-md ring-4 ring-background">
                  {num}
                </div>
                <Icon className="mt-5 h-7 w-7 text-primary/70" />
                <h3 className="mt-3 text-base font-heading font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="relative mt-12 md:hidden">
          {/* Vertical dashed line */}
          <div className="absolute bottom-0 left-6 top-0 w-0.5 border-l-2 border-dashed border-primary/30" />

          <div className="flex flex-col gap-10">
            {steps.map(({ num, Icon, title, desc }) => (
              <Reveal key={num} className="relative flex gap-5">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-md ring-4 ring-background">
                  {num}
                </div>
                <div>
                  <Icon className="mb-1 h-5 w-5 text-primary/70" />
                  <h3 className="text-lg font-heading font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── Delivery Zones ── */}
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="container">
        <Reveal>
          <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
            Delivery Zones
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            We deliver directly to your hotel, Airbnb, cruise terminal, or the airport.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {zones.map((z) => (
            <Reveal key={z.name}>
              <Card className="h-full border border-border bg-card text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="flex flex-col items-center p-6">
                  <z.Icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-3 text-base font-heading font-semibold text-foreground">{z.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{z.areas}</p>
                  <span className={`mt-4 inline-block rounded-full px-4 py-1 text-sm font-bold ${z.color}`}>
                    {z.fee}
                  </span>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            Pickup is always free from all zones
          </p>
        </Reveal>
      </div>
    </section>


    {/* ── What If Something Goes Wrong? ── */}
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <Reveal>
          <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
            What If Something Goes Wrong?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            We've got you covered. Here's how we handle the unexpected.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              Icon: Plane,
              scenario: "\u201cMy flight is delayed\u201d",
              solution:
                "No problem \u2014 we reschedule delivery to whenever you arrive. Just message us.",
            },
            {
              Icon: HelpCircle,
              scenario: "\u201cI\u2019m not sure which equipment I need\u201d",
              solution:
                "Tell us about your trip and mobility needs \u2014 we\u2019ll recommend the perfect fit.",
            },
            {
              Icon: Wrench,
              scenario: "\u201cThe equipment has a problem\u201d",
              solution:
                "We\u2019ll replace it within hours, free of charge. Call or WhatsApp us anytime.",
            },
            {
              Icon: CalendarPlus,
              scenario: "\u201cI need to extend my rental\u201d",
              solution:
                "Easy \u2014 just let us know. We\u2019ll extend it and only charge the extra days.",
            },
            {
              Icon: XCircle,
              scenario: "\u201cI need to cancel\u201d",
              solution:
                "Free cancellation up to 48 hours before delivery. Full refund, no questions.",
            },
            {
              Icon: Phone,
              scenario: "\u201cI have a question during my trip\u201d",
              solution:
                "We\u2019re available 7 days a week via WhatsApp, phone, or email. Real humans, fast replies.",
            },
          ].map(({ Icon, scenario, solution }) => (
            <Reveal key={scenario}>
              <Card className="h-full border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6">
                  <Icon className="h-7 w-7 text-primary" />
                  <p className="mt-3 text-base font-semibold text-foreground">{scenario}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{solution}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mx-auto mt-10 max-w-md text-center text-sm font-medium text-muted-foreground italic">
            Your trip matters to us. We're here to make it stress-free.
          </p>
        </Reveal>
      </div>
    </section>
    {/* ── FAQ ── */}
    <section className="bg-background py-16 md:py-24">
      <div className="container max-w-2xl">
        <Reveal>
          <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
            Booking Questions
          </h2>
        </Reveal>

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

    {/* ── Bottom CTA ── */}
    <section className="bg-primary py-16 md:py-20">
      <div className="container flex flex-col items-center text-center">
        <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">
          Ready to Explore Athens?
        </h2>
        <p className="mt-4 max-w-lg text-primary-foreground/80">
          Browse our equipment, pick your dates, and we'll handle the rest.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-8 rounded-xl px-8 text-base font-semibold">
          <Link to="/equipment">Browse Equipment</Link>
        </Button>
      </div>
    </section>
  </>
);

export default HowItWorks;
