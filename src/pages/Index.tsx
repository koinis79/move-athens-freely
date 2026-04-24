import SEOHead from "@/components/SEOHead";
import { LocalBusiness } from "@/components/StructuredData";
import HeroSection from "@/components/home/HeroSection";
import KoinisTrust from "@/components/home/KoinisTrust";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import EquipmentSection from "@/components/home/EquipmentSection";
import WhySection from "@/components/home/WhySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AccessibleAthensSection from "@/components/home/AccessibleAthensSection";
import CtaBanner from "@/components/home/CtaBanner";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Building2, Home } from "lucide-react";

const Index = () => (
  <>
    <SEOHead
      title="Wheelchair &amp; Mobility Scooter Rental in Athens | Movability"
      description="Rent wheelchairs, mobility scooters &amp; rollators delivered to your Athens hotel. Free city center delivery. Book online in 2 minutes."
    />
    <LocalBusiness />
    <HeroSection />
    <KoinisTrust />
    <HowItWorksSection />
    <EquipmentSection />
    <WhySection />
    <TestimonialsSection />
    <AccessibleAthensSection />
    {/* B2B Partnership — dark, professional, stands apart */}
    <section className="bg-slate-900 dark:bg-slate-950 text-white py-16 md:py-20">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Left: copy */}
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-wider">
              <Briefcase className="h-3.5 w-3.5" /> For Business
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-heading font-bold tracking-tight text-white">
              Hotels &amp; Airbnbs — partner with us
            </h2>
            <p className="mt-4 max-w-xl text-slate-300 leading-relaxed">
              Offer mobility equipment to your guests. We handle delivery, support, and logistics — you earn commission on every referral.
            </p>

            {/* Partner type badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { Icon: Building2, label: "Hotels" },
                { Icon: Home, label: "Airbnbs" },
                { Icon: Briefcase, label: "Travel Agencies" },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-200"
                >
                  <Icon className="h-3 w-3" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex lg:justify-end">
            <Link
              to="/partners"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-8 py-4 text-base font-bold hover:bg-slate-100 transition-colors shadow-lg"
            >
              Become a Partner
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
    <CtaBanner />
  </>
);

export default Index;
