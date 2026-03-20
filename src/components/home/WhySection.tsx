import { Truck, ShieldCheck, Headphones, CalendarX } from "lucide-react";

const features = [
  {
    Icon: Truck,
    heading: "Delivered to Your Door",
    text: "We bring the equipment to your hotel, Airbnb, or cruise port. Free in Athens city center.",
  },
  {
    Icon: ShieldCheck,
    heading: "Quality Guaranteed",
    text: "Every item is inspected and sanitized before delivery. If anything breaks, we replace it same-day.",
  },
  {
    Icon: Headphones,
    heading: "We Speak Your Language",
    text: "Reach us anytime on WhatsApp. Our team speaks English, Greek, and German.",
  },
  {
    Icon: CalendarX,
    heading: "Free Cancellation",
    text: "Plans change. Cancel up to 48 hours before delivery for a full refund — no questions asked.",
  },
];

const WhySection = () => (
  <section className="bg-blue-50 dark:bg-blue-950/20 py-16 md:py-20">
    <div className="container">
      <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
        Why Choose Moveability?
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
        Everything you need for a worry-free trip — delivered.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ Icon, heading, text }) => (
          <div
            key={heading}
            className="group flex flex-col items-center rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-white dark:bg-card p-7 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-5">
              <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-heading font-bold text-gray-900 dark:text-foreground leading-snug">
              {heading}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-muted-foreground leading-relaxed">
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhySection;
