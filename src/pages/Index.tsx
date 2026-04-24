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
import { Building2, ArrowRight } from "lucide-react";

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
    <section className="bg-muted/30 py-6 border-t border-border">
      <div className="container">
        <Link to="/partners" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <Building2 className="h-4 w-4" />
          <span>Hotel or Airbnb? Partner with us</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
    <CtaBanner />
  </>
);

export default Index;
