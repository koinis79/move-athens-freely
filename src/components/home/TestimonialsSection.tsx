import { Link } from "react-router-dom";
import { Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

/* TODO: Restore testimonials when we have real reviews */
const testimonials = [
  {
    quote: "Movability made our Athens trip possible. The wheelchair was delivered to our hotel within hours of landing. Excellent service!",
    name: "Sarah T.",
    location: "London, UK",
  },
  {
    quote: "We rented a mobility scooter for my mother. She was able to explore the Acropolis Museum independently. Thank you!",
    name: "Marco R.",
    location: "Rome, Italy",
  },
  {
    quote: "Professional, responsive, and genuinely caring. The equipment was spotless and exactly what we needed.",
    name: "Anna K.",
    location: "Berlin, Germany",
  },
];

const Stars = () => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
    ))}
  </div>
);

const TestimonialCard = ({ quote, name, location }: (typeof testimonials)[number]) => (
  <Card className="h-full border-none shadow-md">
    <CardContent className="flex h-full flex-col justify-between p-6 md:p-8">
      <div>
        <Stars />
        <blockquote className="mt-4 text-foreground leading-relaxed italic">"{quote}"</blockquote>
      </div>
      <p className="mt-6 text-sm font-semibold text-muted-foreground">{name}, {location}</p>
    </CardContent>
  </Card>
);

const TestimonialsSection = () => (
  <section className="bg-muted/40 py-16 md:py-20">
    <div className="container flex flex-col items-center text-center">
      {/* Icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-5">
        <Users className="h-7 w-7 text-primary" />
      </div>

      {/* Heading + subtext */}
      <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-foreground md:text-4xl">
        Join Our Happy Customers
      </h2>
      <p className="mt-3 max-w-md text-gray-600 dark:text-muted-foreground">
        We're new, but we're committed to making your Athens trip accessible and stress-free.
      </p>

      {/* CTA */}
      <Button asChild size="lg" className="mt-8 rounded-xl px-8 text-base font-semibold">
        <Link to="/equipment">Book Your Equipment</Link>
      </Button>
    </div>
  </section>
);

export default TestimonialsSection;
