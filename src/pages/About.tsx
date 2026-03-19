import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accessibility, MapPin, Heart } from "lucide-react";
import aboutHeroImg from "@/assets/about-hero.png";

const values = [
  {
    Icon: Accessibility,
    title: "Accessibility First",
    desc: "Every decision we make starts with accessibility. From our website (WCAG 2.1 AA compliant) to our equipment selection, we prioritize inclusive design.",
  },
  {
    Icon: MapPin,
    title: "Local Expertise",
    desc: "We live and breathe Athens. We know which routes are smooth, which restaurants have step-free access, and which hidden gems most tourists miss.",
  },
  {
    Icon: Heart,
    title: "Genuine Care",
    desc: "We're not a faceless corporation. When you rent from Moveability, you're supported by people who genuinely care about making your trip memorable.",
  },
];

const About = () => (
  <>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-28">
      <div className="container relative z-10 flex flex-col items-center text-center">
        <h1 className="max-w-3xl text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          About Moveability
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Making Athens accessible, one trip at a time.
        </p>
      </div>
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
    </section>

    {/* Our Story */}
    <section className="bg-background py-16 md:py-24">
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground md:text-4xl">
            Our Story
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Moveability was born from a simple realization: visiting Athens with a
            mobility need shouldn't be stressful. As locals who love this city, we
            saw too many travelers struggling to find reliable equipment, navigate
            confusing rental options, or figure out which attractions were truly
            accessible.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We built Moveability to change that. We're an Athens-based team that
            delivers quality mobility equipment — wheelchairs, scooters, rollators,
            and more — directly to your hotel. But we're more than a rental service.
            We're your local accessibility partner, here to help you experience
            Athens the way it deserves to be experienced: freely, independently, and
            without barriers.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-muted/50">
          <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground">
            <img
              src={aboutHeroImg}
              alt="Someone exploring Athens with mobility equipment"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="bg-primary py-16 md:py-24">
      <div className="container flex flex-col items-center text-center">
        <h2 className="text-2xl font-heading font-bold text-primary-foreground md:text-3xl">
          Our Mission
        </h2>
        <blockquote className="mx-auto mt-8 max-w-3xl text-2xl font-heading font-semibold italic leading-relaxed text-primary-foreground/90 md:text-3xl">
          "To make Athens the most accessible tourist destination in Europe — one
          rental, one guide, one experience at a time."
        </blockquote>
      </div>
    </section>

    {/* Values */}
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
          What We Stand For
        </h2>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3">
          {values.map((v) => (
            <Card
              key={v.title}
              className="border-none bg-muted/50 text-center shadow-none"
            >
              <CardContent className="flex flex-col items-center p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <v.Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-5 text-xl font-heading font-semibold text-foreground">
                  {v.title}
                </h3>
                <p className="mt-3 text-muted-foreground">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Vision */}
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-heading font-bold text-foreground md:text-4xl">
          Where We're Headed
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          We're starting with equipment rental in Athens, but our vision is bigger.
          Soon we'll offer accessible tours led by expert guides, airport transfer
          services with adapted vehicles, and partnerships with hotels across
          Greece. We want to be the first place anyone thinks of when planning an
          accessible trip to Greece.
        </p>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-primary py-16 md:py-20">
      <div className="container flex flex-col items-center text-center">
        <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">
          Ready to explore Athens?
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-xl px-8 text-base font-semibold"
          >
            <Link to="/equipment">Browse Equipment</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl border-primary-foreground/30 px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  </>
);

export default About;
