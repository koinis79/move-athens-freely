import { MapPin, ShieldCheck, Truck, Headset } from "lucide-react";

const features = [
  {
    Icon: MapPin,
    title: "Athens-Based",
    desc: "We're local. We know every ramp, every route, every accessible gem in Athens.",
  },
  {
    Icon: ShieldCheck,
    title: "Quality Guaranteed",
    desc: "Every item is inspected, sanitized, and maintained to the highest standards.",
  },
  {
    Icon: Truck,
    title: "Hotel Delivery",
    desc: "Free delivery and pickup within Athens city center. Zone-based pricing for suburbs and airport.",
  },
  {
    Icon: Headset,
    title: "24/7 Support",
    desc: "Reach us anytime via WhatsApp, phone, or email. We speak English and Greek.",
  },
];

const WhySection = () => (
  <section className="bg-primary/5 py-16 md:py-20">
    <div className="container">
      <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
        Why Moveability?
      </h2>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-heading font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhySection;
