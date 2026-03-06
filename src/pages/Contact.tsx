import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Send,
} from "lucide-react";

/* ── Form schema ────────────────────────────────────────── */
const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(1, "Please select a subject"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message must be less than 2000 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

/* ── Store locations ────────────────────────────────────── */
const stores = [
  {
    name: "Athens Center",
    address: "Stadiou 31, 105 59 Athens",
    phone: "210 32 23 041",
  },
  {
    name: "Kallithea",
    address: "Davaki 16, 176 72 Kallithea",
    phone: "210 95 11 750",
  },
  {
    name: "Chalandri",
    address: "Kolokotroni 22, 152 33 Chalandri",
    phone: "210 68 35 517",
  },
  {
    name: "Korinthos",
    address: "Koliatsou 50, 20 100 Korinthos",
    phone: "27410 28 607",
  },
];

/* ── FAQ ────────────────────────────────────────────────── */
const faqs = [
  {
    q: "How far in advance should I book?",
    a: "We recommend booking at least 48 hours in advance to guarantee availability, especially during peak season (April–October). However, we do our best to accommodate last-minute requests — just contact us.",
  },
  {
    q: "Do you deliver to Airbnbs?",
    a: "Yes! We deliver to hotels, Airbnbs, vacation rentals, and any other accommodation in our delivery zones. Just provide the full address and any access instructions when you book.",
  },
  {
    q: "What if the equipment breaks?",
    a: "All equipment is covered by our rental insurance. Contact us immediately and we'll arrange a replacement at no extra cost. We aim to deliver a replacement within a few hours.",
  },
  {
    q: "Can I extend my rental?",
    a: "Absolutely. Contact us at least 24 hours before your rental ends and we'll extend it — subject to availability. You'll only be charged the difference based on our tiered pricing.",
  },
];

/* ── Business hours ─────────────────────────────────────── */
const hours = [
  { days: "Monday & Wednesday", time: "09:00 – 17:00" },
  { days: "Tuesday, Thursday & Friday", time: "09:00 – 20:30" },
  { days: "Saturday", time: "09:00 – 16:00" },
  { days: "Sunday", time: "Closed" },
];

/* ════════════════════════════════════════════════════════ */

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (_data: ContactFormValues) => {
    // TODO: store in Supabase contact_inquiries table
    setSubmitted(true);
  };

  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-20">
        <div className="container text-center">
          <h1 className="text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            We'd love to hear from you — whether it's a question, feedback, or a
            partnership inquiry.
          </p>
        </div>
      </section>

      {/* ── Form + Info ───────────────────────────────── */}
      <section className="bg-background py-16 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — form */}
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground md:text-3xl">
              Get in Touch
            </h2>
            <p className="mt-2 text-muted-foreground">
              Have questions about equipment, accessibility in Athens, or your
              upcoming trip? We're here to help.
            </p>

            {submitted ? (
              <div className="mt-8 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-6">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">
                    Thanks! We'll get back to you within 24 hours.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check your email for a confirmation.
                  </p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-8 space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+30 210 ..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">
                              General Inquiry
                            </SelectItem>
                            <SelectItem value="equipment">
                              Equipment Question
                            </SelectItem>
                            <SelectItem value="booking">
                              Booking Support
                            </SelectItem>
                            <SelectItem value="partnership">
                              Partnership Inquiry
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us how we can help..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </Form>
            )}
          </div>

          {/* Right — contact info */}
          <div className="space-y-8">
            {/* WhatsApp */}
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-foreground">
                    WhatsApp
                  </p>
                  <p className="text-sm text-muted-foreground">
                    +30 210 95 11 750
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <a
                    href="https://wa.me/302109511750"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat with us
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Email */}
            <div className="flex items-start gap-4">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <a
                  href="mailto:info@moveability.gr"
                  className="text-sm text-primary underline underline-offset-2"
                >
                  info@moveability.gr
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Phone</p>
                <a
                  href="tel:+302109511750"
                  className="text-sm text-muted-foreground"
                >
                  +30 210 95 11 750
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-4">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Business Hours</p>
                <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                  {hours.map((h) => (
                    <li key={h.days}>
                      <span className="font-medium text-foreground">
                        {h.days}:
                      </span>{" "}
                      {h.time}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Address + map placeholder */}
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Location</p>
                <p className="text-sm text-muted-foreground">Athens, Greece</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-muted/50">
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" />
                Google Maps embed placeholder
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Store locations ───────────────────────────── */}
      <section className="bg-muted/40 py-16 md:py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
            Our 4 Athens Locations
          </h2>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((s) => (
              <Card key={s.name} className="border border-border bg-card shadow-sm">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <MapPin className="h-7 w-7 text-primary" />
                  <h3 className="mt-3 text-lg font-heading font-semibold text-foreground">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.address}
                  </p>
                  <a
                    href={`tel:+30${s.phone.replace(/\s/g, "")}`}
                    className="mt-3 text-sm font-medium text-primary"
                  >
                    {s.phone}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Answers ─────────────────────────────── */}
      <section className="bg-background py-16 md:py-24">
        <div className="container max-w-2xl">
          <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
            Quick Answers
          </h2>

          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium text-foreground">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 text-center">
            <Button asChild variant="link" className="gap-1">
              <Link to="/faq">
                View all FAQs <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
