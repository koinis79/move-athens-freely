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
  availability: Availability;
  popular?: boolean;
  image: string;
}

export const categorySlugMap: Record<string, EquipmentCategory> = {
  wheelchairs: "Wheelchair",
  "power-wheelchairs": "Power Wheelchair",
  "mobility-scooters": "Mobility Scooter",
  "rollators-walkers": "Rollator",
};

export const categoryFilterLabels = [
  { label: "All", slug: "" },
  { label: "Wheelchairs", slug: "wheelchairs" },
  { label: "Power Wheelchairs", slug: "power-wheelchairs" },
  { label: "Mobility Scooters", slug: "mobility-scooters" },
  { label: "Rollators & Walkers", slug: "rollators-walkers" },
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
    availability: "Available",
    image: foldableTravelScooterImg,
  },
  {
    id: "7",
    slug: "standard-rollator-with-seat",
    name: "Standard Rollator with Seat",
    category: "Rollator",
    categorySlug: "rollators-walkers",
    description: "Four-wheeled rollator with built-in seat, basket, and hand brakes.",
    pricePerDay: 5,
    pricePerWeek: 30,
    availability: "Available",
    image: standardRollatorImg,
  },
  {
    id: "8",
    slug: "lightweight-carbon-rollator",
    name: "Lightweight Carbon Rollator",
    category: "Rollator",
    categorySlug: "rollators-walkers",
    description: "Premium carbon-fibre rollator, extremely light yet durable.",
    pricePerDay: 8,
    pricePerWeek: 45,
    availability: "Available",
    image: lightweightCarbonRollatorImg,
  },
];
