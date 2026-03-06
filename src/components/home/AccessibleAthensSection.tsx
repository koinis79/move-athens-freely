import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import acropolisImg from "@/assets/guides/acropolis.jpg";
import restaurantsImg from "@/assets/guides/restaurants.jpg";
import airportImg from "@/assets/guides/airport-transfer.jpg";

const guides = [
  {
    title: "Is the Acropolis Wheelchair Accessible?",
    excerpt:
      "Discover the accessible routes, lifts, and facilities available at the Acropolis archaeological site.",
    slug: "acropolis",
    image: acropolisImg,
  },
  {
    title: "Accessible Restaurants in Plaka",
    excerpt:
      "A curated list of wheelchair-friendly restaurants in Athens' historic Plaka neighborhood.",
    slug: "restaurants",
    image: restaurantsImg,
  },
  {
    title: "Getting from Athens Airport with Mobility Equipment",
    excerpt:
      "Your complete guide to accessible transport options from Athens International Airport.",
    slug: "airport-transfer",
    image: airportImg,
  },
];

const AccessibleAthensSection = () => (
  <section className="bg-muted/30 py-16 md:py-20">
    <div className="container">
      <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
        Discover Accessible Athens
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
        Practical guides to help you explore Athens with confidence
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map(({ title, excerpt, slug, image }) => (
          <Link key={slug} to={`/accessible-athens/${slug}`} className="group">
            <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg h-full">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Read Guide <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default AccessibleAthensSection;
