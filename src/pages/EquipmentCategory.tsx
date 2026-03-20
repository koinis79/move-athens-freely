import { useParams, Navigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import EquipmentListing from "@/components/equipment/EquipmentListing";
import { categorySlugMap } from "@/data/equipment";

const validSlugs = Object.keys(categorySlugMap);

const categoryMeta: Record<string, { title: string; description: string }> = {
  wheelchairs: {
    title: "Wheelchair Rental Athens \u2013 Delivery to Your Hotel | Moveability",
    description: "Rent lightweight folding wheelchairs in Athens from \u20ac35/day. Free delivery in city center. Airport pickup available.",
  },
  "power-wheelchairs": {
    title: "Electric Wheelchair Hire Athens | Moveability",
    description: "Rent power wheelchairs in Athens from \u20ac150/day. Joystick control, all-day battery. Delivered to your hotel.",
  },
  "mobility-scooters": {
    title: "Mobility Scooter Rental Athens Greece | Moveability",
    description: "Rent 4-wheel mobility scooters in Athens from \u20ac100/day. 35km range. Hotel delivery included.",
  },
  rollators: {
    title: "Rollator Rental Athens | Moveability",
    description: "Rent rollators and walking aids in Athens. Lightweight, foldable options. Delivered to your hotel.",
  },
};

const EquipmentCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  if (!categorySlug || !validSlugs.includes(categorySlug)) {
    return <Navigate to="/equipment" replace />;
  }

  const meta = categoryMeta[categorySlug];

  return (
    <>
      {meta && <SEOHead title={meta.title} description={meta.description} />}
      <EquipmentListing categorySlug={categorySlug} />
    </>
  );
};

export default EquipmentCategory;
