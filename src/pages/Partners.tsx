import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Handshake,
  Package,
  Phone,
  Plane,
  Loader2,
  Ship,
  Sparkles,
  Briefcase,
  Home,
  CheckCircle2,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BUSINESS_TYPES = [
  "Hotel / Resort",
  "Airbnb / Vacation Rental",
  "Travel Agency",
  "Tour Operator",
  "Cruise Line",
  "Other",
];

const Partners = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessType: BUSINESS_TYPES[0],
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.contactPerson.trim() || !form.email.trim()) {
      toast({
        title: "Please fill in all required fields",
        description: "Business name, contact person, and email are required.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const bodyText = [
      `Business Name: ${form.businessName.trim()}`,
      `Business Type: ${form.businessType}`,
      form.message.trim() ? `\nMessage:\n${form.message.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase.from("contact_inquiries").insert({
      name: form.contactPerson.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: `B2B: ${form.businessType} — ${form.businessName.trim()}`,
      message: bodyText,
      source: "b2b_inquiry",
    });
    setSubmitting(false);
    if (error) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setSubmitted(true);
    toast({ title: "Thanks — we'll be in touch within 1 business day" });
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const benefits = [
    { Icon: Sparkles, title: "Delight Your Guests", text: "Offer wheelchairs, scooters, and mobility aids as a premium service — the kind of detail guests remember in reviews." },
    { Icon: Package, title: "Zero Inventory", text: "No storage, no maintenance, no hidden costs. We deliver directly to your guests and pick up when they're done." },
    { Icon: Handshake, title: "Commission or Discount", text: "Earn on every referred booking, or get preferred partner rates for your own operations. Your choice." },
    { Icon: Phone, title: "24/7 Support", text: "Our team handles every customer question, delivery change, and equipment issue. Your front desk stays focused." },
  ];

  const steps = [
    { num: 1, title: "Sign up as a partner", text: "Tell us about your business. We'll set up your partner account within 1 business day." },
    { num: 2, title: "Refer or integrate", text: "Share a custom referral link, add us to your booking flow, or hand out branded partner cards." },
    { num: 3, title: "We deliver, you earn", text: "We handle delivery, pickup, and support. You get monthly commission reports and payouts." },
  ];

  const partnerTypes = [
    { Icon: Building2, label: "Hotels & Resorts" },
    { Icon: Home, label: "Airbnb & Vacation Rentals" },
    { Icon: Briefcase, label: "Travel Agencies" },
    { Icon: Plane, label: "Tour Operators" },
    { Icon: Ship, label: "Cruise Lines" },
  ];

  return (
    <>
      <SEOHead
        title="Partner with Movability — Mobility Equipment for Hotels, Airbnbs & Travel Businesses"
        description="Offer wheelchairs, scooters, and mobility aids to your guests. Zero inventory, commission-based, full support. Partner with Movability in Athens."
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-28">
        <div className="container relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-5">
            <Handshake className="h-3.5 w-3.5" /> B2B Partnership
          </div>
          <h1 className="max-w-3xl text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Partner With Movability
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Offer mobility equipment to your guests. We handle everything.
          </p>
          <a href="#contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-8 py-3.5 text-base font-bold hover:bg-primary/90 transition-colors">
            Become a Partner
          </a>
        </div>
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-heading font-bold text-foreground md:text-4xl">Why partner with us</h2>
            <p className="mt-3 text-muted-foreground">A turnkey mobility service that adds value to every stay.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-heading font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-heading font-bold text-foreground md:text-4xl">How partnership works</h2>
            <p className="mt-3 text-muted-foreground">Three steps from signup to first payout.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(({ num, title, text }) => (
              <div key={num} className="relative rounded-2xl border border-border bg-card p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{num}</div>
                <h3 className="mt-4 text-base font-heading font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-heading font-bold text-foreground md:text-4xl">We partner with</h2>
            <p className="mt-3 text-muted-foreground">Any business that hosts, serves, or guides travelers in Athens.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 max-w-4xl mx-auto">
            {partnerTypes.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center rounded-xl border border-border bg-card px-4 py-6 transition-colors hover:border-primary/40">
                <Icon className="h-8 w-8 text-primary mb-3" />
                <p className="text-sm font-medium text-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-muted/30 py-16 md:py-24">
        <div className="container max-w-xl">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold text-foreground md:text-4xl">Get in touch</h2>
            <p className="mt-3 text-muted-foreground">Tell us about your business and we'll get back to you within 1 business day.</p>
          </div>

          {submitted ? (
            <div className="mt-10 rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-4 text-xl font-heading font-bold text-foreground">Thanks, we received your inquiry</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A member of our partnerships team will reach out within 1 business day. In the meantime, feel free to <Link to="/equipment" className="text-primary font-medium hover:underline">explore our equipment catalog</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="businessName" className="text-sm font-medium text-foreground">Business name <span className="text-red-500">*</span></label>
                  <input id="businessName" type="text" required value={form.businessName} onChange={(e) => set("businessName", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Hotel Grande Bretagne" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contactPerson" className="text-sm font-medium text-foreground">Contact person <span className="text-red-500">*</span></label>
                  <input id="contactPerson" type="text" required value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Maria Papadopoulos" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email <span className="text-red-500">*</span></label>
                  <input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="maria@hotel.gr" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</label>
                  <input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+30 210 000 0000" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="businessType" className="text-sm font-medium text-foreground">Business type</label>
                  <select id="businessType" value={form.businessType} onChange={(e) => set("businessType", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {BUSINESS_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">How can we help?</label>
                  <textarea id="message" rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} className="w-full min-h-[96px] px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Tell us about your business and what kind of partnership you're looking for." />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-base font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending..." : "Submit partnership inquiry"}
              </button>
              <p className="text-xs text-center text-muted-foreground">We respect your inbox. Only partnership correspondence — no marketing emails.</p>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default Partners;
