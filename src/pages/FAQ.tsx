import SEOHead from "@/components/SEOHead";
import { FAQPage as FAQPageSD } from "@/components/StructuredData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, ArrowRight } from "lucide-react";

/* ── FAQ sections ───────────────────────────────────────── */
const sections = [
  {
    title: "Booking & Pricing",
    items: [
      {
        q: "What equipment do you offer?",
        a: "We offer manual wheelchairs, power wheelchairs, mobility scooters, rollators, knee scooters, crutches, and portable ramps. Browse our full range on the Equipment page.",
      },
      {
        q: "How far in advance should I book?",
        a: "We recommend booking at least 48 hours in advance, especially during peak tourist season (April–October). Last-minute bookings are possible subject to availability.",
      },
      {
        q: "What are your prices?",
        a: "Prices are per rental period, not per day. Rollators start from €20 for 1–3 days. Manual wheelchairs from €35. Mobility scooters from €100. Power wheelchairs from €150. The longer you rent, the lower your daily cost — see the Equipment page for full pricing.",
      },
      {
        q: "Do I need to pay a deposit?",
        a: "A small security deposit may apply for power wheelchairs and mobility scooters. This is fully refundable when the equipment is returned in good condition.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) via our secure Stripe payment system. Apple Pay and Google Pay are also available.",
      },
      {
        q: "Can I cancel or modify my booking?",
        a: "Free cancellation is available up to 48 hours before your delivery date. Modifications can be made by contacting us via WhatsApp, email, or phone.",
      },
    ],
  },
  {
    title: "Delivery & Pickup",
    items: [
      {
        q: "Do you deliver to hotels?",
        a: "Yes! We deliver to your hotel, Airbnb, vacation rental, or any accommodation in Athens. Just provide the address when booking.",
      },
      {
        q: "Do you deliver to the airport?",
        a: "Yes, we deliver and pick up at Athens International Airport (Eleftherios Venizelos) for a €30 delivery fee.",
      },
      {
        q: "Do you deliver to cruise ports?",
        a: "Yes — we deliver directly to Piraeus Cruise Terminal and Piraeus Ferry Port for a €25 fee. Book in advance with your ship name and arrival time.",
      },
      {
        q: "How does pickup work?",
        a: "On your last rental day, we collect the equipment from your accommodation. You can leave it at reception if you're heading out early. We coordinate the details with you in advance.",
      },
      {
        q: "What are your delivery hours?",
        a: "We deliver 7 days a week. You can choose your preferred delivery window (morning, afternoon, or evening) during checkout.",
      },
    ],
  },
  {
    title: "Equipment & Safety",
    items: [
      {
        q: "Is the equipment clean and safe?",
        a: "Every item is professionally sanitized, inspected, and tested between rentals. We are part of Koinis Healthcare Group, a certified medical equipment provider since 1982.",
      },
      {
        q: "What if the equipment breaks during my trip?",
        a: "Contact us immediately via WhatsApp (+30 210 95 11 750) or phone. We'll arrange a free replacement within hours — no extra charge.",
      },
      {
        q: "Can I try the equipment before renting?",
        a: "Our team demonstrates the equipment when delivering. If it's not the right fit, we'll swap it for a better option.",
      },
      {
        q: "Do you offer insurance?",
        a: "Basic equipment insurance is included in all rentals. For additional coverage, please contact us.",
      },
    ],
  },
  {
    title: "Accessibility in Athens",
    items: [
      {
        q: "Is Athens wheelchair accessible?",
        a: "Athens has made significant improvements in recent years. The Acropolis has ramps and an elevator, the metro system is accessible, and many museums are fully adapted. Visit our Accessible Athens guide for detailed local information.",
      },
      {
        q: "Can you help me plan an accessible trip?",
        a: "We'd love to. Contact us with your travel dates and interests and we'll share personalized recommendations for accessible attractions, restaurants, and routes in Athens.",
      },
    ],
  },
];

const FAQ = () => (
  <>
    <SEOHead
      title="FAQ – Mobility Equipment Rental Athens | Moveability"
      description="Answers to common questions about renting wheelchairs and mobility scooters in Athens. Delivery, pricing, cancellation and more."
    />
    <FAQPageSD questions={sections.flatMap((s) => s.items)} />

    {/* Hero */}
    <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Everything you need to know about renting mobility equipment in Athens
        </p>
      </div>
    </section>

    {/* FAQ accordion — single global instance so only one answer is open at a time */}
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-10">
          {sections.map((section, si) => (
            <div key={si}>
              <h2 className="mb-2 text-xl font-heading font-bold text-foreground md:text-2xl">
                {section.title}
              </h2>
              <div className="rounded-xl border bg-card">
                {section.items.map((faq, fi) => (
                  <AccordionItem
                    key={fi}
                    value={`s${si}-q${fi}`}
                    className="px-5 last:border-b-0"
                  >
                    <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline hover:text-primary">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            </div>
          ))}
        </Accordion>
      </div>
    </section>

    {/* Bottom CTA */}
    <section className="bg-primary py-16 md:py-20">
      <div className="container flex flex-col items-center text-center">
        <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">
          Still have questions?
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="gap-2 rounded-xl px-8 text-base font-semibold"
          >
            <a
              href="https://wa.me/302109511750"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-1 rounded-xl border-primary-foreground/30 px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link to="/contact">
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  </>
);

export default FAQ;
