// Equipment product images
import lightweightFoldingWheelchairImg from "@/assets/equipment/lightweight-folding-wheelchair.jpg";
import heavyDutyWheelchairImg from "@/assets/equipment/heavy-duty-wheelchair.jpg";
import compactPowerWheelchairImg from "@/assets/equipment/compact-power-wheelchair.jpg";
import premiumPowerWheelchairImg from "@/assets/equipment/premium-power-wheelchair.jpg";
import fourWheelScooterImg from "@/assets/equipment/4-wheel-mobility-scooter.jpg";
import foldableTravelScooterImg from "@/assets/equipment/foldable-travel-scooter.jpg";
import standardRollatorImg from "@/assets/equipment/standard-rollator.jpg";
import lightweightCarbonRollatorImg from "@/assets/equipment/lightweight-carbon-rollator.jpg";

export type EquipmentCategory =
  | "Wheelchair"
  | "Power Wheelchair"
  | "Mobility Scooter"
  | "Rollator";

export type Availability = "Available" | "Limited" | "Unavailable";

export interface EquipmentItem {
  id: string;
  slug: string;
  name: string;
  category: EquipmentCategory;
  categorySlug: string;
  description: string;
  pricePerDay: number;
  pricePerWeek: number;
  priceTier1: number;
  priceTier2: number;
  priceTier3: number;
  priceTier4: number;
  availability: Availability;
  popular?: boolean;
  image: string;
}

/** Return the correct tier price for a given number of rental days */
export function getPriceForDays(item: EquipmentItem, days: number): number {
  if (days <= 3) return item.priceTier1;
  if (days <= 7) return item.priceTier2;
  if (days <= 14) return item.priceTier3;
  return item.priceTier4;
}

export const categorySlugMap: Record<string, EquipmentCategory> = {
  wheelchairs: "Wheelchair",
  "power-wheelchairs": "Power Wheelchair",
  "mobility-scooters": "Mobility Scooter",
  "walking-aids": "Rollator",
};

export const categoryFilterLabels = [
  { label: "All", slug: "" },
  { label: "Wheelchairs", slug: "wheelchairs" },
  { label: "Power Wheelchairs", slug: "power-wheelchairs" },
  { label: "Mobility Scooters", slug: "mobility-scooters" },
  { label: "Rollators", slug: "walking-aids" },
];

export const equipmentItems: EquipmentItem[] = [
  {
    id: "1",
    slug: "lightweight-folding-wheelchair",
    name: "Lightweight Folding Wheelchair",
    category: "Wheelchair",
    categorySlug: "wheelchairs",
    description: "Ultra-light aluminium frame, folds compactly for travel and storage.",
    pricePerDay: 10,
    pricePerWeek: 60,
    priceTier1: 10,
    priceTier2: 60,
    priceTier3: 100,
    priceTier4: 200,
    availability: "Available",
    popular: true,
    image: lightweightFoldingWheelchairImg,
  },
  {
    id: "2",
    slug: "heavy-duty-wheelchair-150kg",
    name: "Heavy-Duty Wheelchair (150kg)",
    category: "Wheelchair",
    categorySlug: "wheelchairs",
    description: "Reinforced steel frame supporting up to 150 kg with padded seating.",
    pricePerDay: 15,
    pricePerWeek: 85,
    priceTier1: 15,
    priceTier2: 85,
    priceTier3: 150,
    priceTier4: 280,
    availability: "Available",
    image: heavyDutyWheelchairImg,
  },
  {
    id: "3",
    slug: "compact-power-wheelchair",
    name: "Compact Power Wheelchair",
    category: "Power Wheelchair",
    categorySlug: "power-wheelchairs",
    description: "Joystick-controlled electric wheelchair, ideal for city exploration.",
    pricePerDay: 35,
    pricePerWeek: 210,
    priceTier1: 35,
    priceTier2: 210,
    priceTier3: 380,
    priceTier4: 700,
    availability: "Available",
    popular: true,
    image: compactPowerWheelchairImg,
  },
  {
    id: "4",
    slug: "premium-power-wheelchair",
    name: "Premium Power Wheelchair",
    category: "Power Wheelchair",
    categorySlug: "power-wheelchairs",
    description: "Top-of-the-line power chair with extended battery and suspension.",
    pricePerDay: 45,
    pricePerWeek: 280,
    priceTier1: 45,
    priceTier2: 280,
    priceTier3: 500,
    priceTier4: 900,
    availability: "Limited",
    image: premiumPowerWheelchairImg,
  },
  {
    id: "5",
    slug: "4-wheel-mobility-scooter",
    name: "4-Wheel Mobility Scooter",
    category: "Mobility Scooter",
    categorySlug: "mobility-scooters",
    description: "Stable four-wheel scooter perfect for outdoor sightseeing in Athens.",
    pricePerDay: 25,
    pricePerWeek: 150,
    priceTier1: 25,
    priceTier2: 150,
    priceTier3: 270,
    priceTier4: 500,
    availability: "Available",
    popular: true,
    image: fourWheelScooterImg,
  },
  {
    id: "6",
    slug: "foldable-travel-scooter",
    name: "Foldable Travel Scooter",
    category: "Mobility Scooter",
    categorySlug: "mobility-scooters",
    description: "Lightweight foldable scooter that fits in most car trunks and taxis.",
    pricePerDay: 30,
    pricePerWeek: 180,
    priceTier1: 30,
    priceTier2: 180,
    priceTier3: 320,
    priceTier4: 600,
    availability: "Available",
    image: foldableTravelScooterImg,
  },
  {
    id: "7",
    slug: "standard-rollator-with-seat",
    name: "Standard Rollator with Seat",
    category: "Rollator",
    categorySlug: "walking-aids",
    description: "Four-wheeled rollator with built-in seat, basket, and hand brakes.",
    pricePerDay: 5,
    pricePerWeek: 30,
    priceTier1: 5,
    priceTier2: 30,
    priceTier3: 50,
    priceTier4: 90,
    availability: "Available",
    image: standardRollatorImg,
  },
  {
    id: "8",
    slug: "lightweight-carbon-rollator",
    name: "Lightweight Carbon Rollator",
    category: "Rollator",
    categorySlug: "walking-aids",
    description: "Premium carbon-fibre rollator, extremely light yet durable.",
    pricePerDay: 8,
    pricePerWeek: 45,
    priceTier1: 8,
    priceTier2: 45,
    priceTier3: 80,
    priceTier4: 150,
    availability: "Available",
    image: lightweightCarbonRollatorImg,
  },
];
