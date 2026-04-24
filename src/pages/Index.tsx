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
    <CtaBanner />
  </>
);

export default Index;
