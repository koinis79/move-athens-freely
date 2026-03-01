import { Search, CalendarDays, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    num: 1,
    Icon: Search,
    title: "Choose Your Equipment",
    desc: "Browse our range of wheelchairs, scooters, and rollators. Filter by your needs.",
  },
  {
    num: 2,
    Icon: CalendarDays,
    title: "Book Online",
    desc: "Pick your dates, enter your hotel details, and pay securely online.",
  },
  {
    num: 3,
    Icon: Truck,
    title: "We Deliver",
    desc: "Equipment arrives at your accommodation, sanitized and ready. Free pickup when you're done.",
  },
];

const HowItWorksSection = () => (
  <section className="bg-background py-16 md:py-20">
    <div className="container">
      <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
        How It Works
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

export default HowItWorksSection;
