import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-athens.jpg";

const trustItems = [
  "Free delivery in city center",
  "Sanitized equipment",
  "Athens-based support",
];

const HeroSection = () => (
  <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
    {/* Background image - light mode only */}
    <div
      className="absolute inset-0 bg-cover bg-center dark:hidden"
      style={{ backgroundImage: `url(${heroImage})` }}
    />
    {/* Light overlay for readability */}
    <div className="absolute inset-0 bg-white/75 dark:hidden" />

    {/* Dark mode fallback gradient */}
    <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-primary/10 via-background to-background" />

    {/* Decorative blobs */}
    <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

    <div className="container relative z-10 flex flex-col items-center text-center">
      <h1 className="max-w-3xl text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
        Move Freely. Explore Athens.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
        Rent wheelchairs, scooters, and mobility aids delivered to your hotel.
        Explore the Acropolis, stroll through Plaka, and enjoy Athens without
        barriers.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg" className="rounded-xl px-8 text-base font-semibold">
          <Link to="/equipment">Browse Equipment</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl px-8 text-base font-semibold">
          <Link to="/how-it-works">How It Works</Link>
        </Button>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
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

export default HeroSection;
