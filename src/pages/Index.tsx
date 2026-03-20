import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import EquipmentSection from "@/components/home/EquipmentSection";
import WhySection from "@/components/home/WhySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AccessibleAthensSection from "@/components/home/AccessibleAthensSection";
import CtaBanner from "@/components/home/CtaBanner";

const Index = () => (
  <>
    <SEOHead
      title="Wheelchair &amp; Mobility Scooter Rental in Athens | Moveability"
      description="Rent wheelchairs, mobility scooters &amp; rollators delivered to your Athens hotel. Free city center delivery. Book online in 2 minutes."
    />
    <HeroSection />
    <HowItWorksSection />
    <EquipmentSection />
    <WhySection />
    <TestimonialsSection />
    <AccessibleAthensSection />
    <CtaBanner />
  </>
);

export default Index;
