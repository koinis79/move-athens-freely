import { Link } from "react-router-dom";
import { Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote: "This company was very polite and easy to deal with. I would recommend using them if you need mobility equipment in Athens.",
    name: "Susan K.",
    location: "Google review",
  },
  {
    quote: "Excellent service, very easy to deal with at reasonable prices. A brand new wheelchair was delivered to our address on time which made the trip far more enjoyable for my mother.",
    name: "Berk G.",
    location: "Local Guide, Google review",
  },
  {
    quote: "Servizio ottimo! Abbiamo ricevuto la sedia a rotelle direttamente in camera prima del nostro arrivo, siamo riuscite a vedere Atene tranquillamente.",
    translation: "(Excellent service! We received the wheelchair right in our room before our arrival, and we were able to see Athens with ease.)",
    name: "Eliana F.",
    location: "Local Guide, Google review",
  },
];

const Stars = () => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
    ))}
  </div>
);

type Testimonial = typeof testimonials[number];

const TestimonialCard = ({ quote, translation, name, location }: Testimonial) => (
  <Card className="h-full border-none shadow-md text-left">
    <CardContent className="flex h-full flex-col justify-between p-6 md:p-8">
      <div>
        <Stars />
        <blockquote className="mt-4 text-foreground leading-relaxed italic">"{quote}"</blockquote>
        {translation && (
          <p className="mt-2 text-sm text-muted-foreground italic">{translation}</p>
        )}
      </div>
      <p className="mt-6 text-sm font-semibold text-muted-foreground">
        {name} <span className="font-normal opacity-80 whitespace-nowrap">· {location}</span>
      </p>
    </CardContent>
  </Card>
);

const TestimonialsSection = () => (
  <section className="bg-muted/40 py-16 md:py-20">
    <div className="container flex flex-col items-center text-center">
      {/* Icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-5">
        <Star className="h-7 w-7 text-primary fill-primary" />
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-foreground md:text-4xl">
        What Our Customers Say
      </h2>
      <p className="mt-3 max-w-md text-gray-600 dark:text-muted-foreground">
        Hear from families and travelers who explored Athens with Movability.
      </p>

      {/* Grid of testimonials */}
      <div className="mt-12 grid gap-6 w-full max-w-6xl md:grid-cols-3">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="rounded-xl px-8 text-base font-semibold">
          <Link to="/equipment">Book Your Equipment</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl px-8 text-base font-semibold bg-background hover:bg-muted">
          <a href="https://g.page/r/CRIC4z0HieHaEBM/review" target="_blank" rel="noopener noreferrer">
            See all our reviews on Google ⭐
          </a>
        </Button>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
