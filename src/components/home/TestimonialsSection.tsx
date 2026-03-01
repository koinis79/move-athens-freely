import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const testimonials = [
  {
    quote:
      "Moveability made our Athens trip possible. The wheelchair was delivered to our hotel within hours of landing. Excellent service!",
    name: "Sarah T.",
    location: "London, UK",
  },
  {
    quote:
      "We rented a mobility scooter for my mother. She was able to explore the Acropolis Museum independently. Thank you!",
    name: "Marco R.",
    location: "Rome, Italy",
  },
  {
    quote:
      "Professional, responsive, and genuinely caring. The equipment was spotless and exactly what we needed.",
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

const TestimonialCard = ({
  quote,
  name,
  location,
}: (typeof testimonials)[number]) => (
  <Card className="h-full border-none shadow-md">
    <CardContent className="flex h-full flex-col justify-between p-6 md:p-8">
      <div>
        <Stars />
        <blockquote className="mt-4 text-foreground leading-relaxed italic">
          "{quote}"
        </blockquote>
      </div>
      <p className="mt-6 text-sm font-semibold text-muted-foreground">
        {name}, {location}
      </p>
    </CardContent>
  </Card>
);

const TestimonialsSection = () => (
  <section className="bg-background py-16 md:py-20">
    <div className="container">
      <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
        What Our Customers Say
      </h2>

      {/* Desktop grid */}
      <div className="mt-12 hidden gap-6 md:grid md:grid-cols-3">
        {testimonials.map((t) => (
          <TestimonialCard key={t.name} {...t} />
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="mt-12 md:hidden">
        <Carousel opts={{ align: "start" }} className="mx-auto max-w-sm">
          <CarouselContent>
            {testimonials.map((t) => (
              <CarouselItem key={t.name}>
                <TestimonialCard {...t} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4" />
          <CarouselNext className="-right-4" />
        </Carousel>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
