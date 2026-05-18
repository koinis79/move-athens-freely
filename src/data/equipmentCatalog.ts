/**
 * Static metadata for equipment items referenced in article CTAs.
 * Keeps article rendering instant — no DB roundtrip per article view.
 * Update prices/images here when they change in the DB.
 */
export interface EquipmentMeta {
  slug: string;
  categorySlug: string;
  name: string;
  shortDesc: string;
  price: number;
  image: string;
}

export const equipmentCatalog: Record<string, EquipmentMeta> = {
  "manual-wheelchair": {
    slug: "manual-wheelchair",
    categorySlug: "wheelchairs",
    name: "Manual Wheelchair",
    shortDesc: "Self-propel or pushed by companion. Folds for transport.",
    price: 49,
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/wheelchair-rental-plaka-athens.png",
  },
  "transit-wheelchair": {
    slug: "transit-wheelchair",
    categorySlug: "wheelchairs",
    name: "Transit Wheelchair",
    shortDesc: "Lightweight, pushed by companion. Ideal for airports & sightseeing.",
    price: 49,
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/wheelchair-rental-plaka-athens.png",
  },
  "lightweight-folding-wheelchair": {
    slug: "lightweight-folding-wheelchair",
    categorySlug: "wheelchairs",
    name: "Lightweight Folding Wheelchair",
    shortDesc: "Premium aluminum, folds in seconds. Our most popular pick for travelers.",
    price: 79,
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/wheelchair-rental-plaka-athens.png",
  },
  "electric-mobility-scooter": {
    slug: "electric-mobility-scooter",
    categorySlug: "mobility-scooters",
    name: "Electric Mobility Scooter",
    shortDesc: "4 wheels, 25km range. Perfect for exploring streets, parks, attractions.",
    price: 120,
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/mobility-scooter-acropolis-athens.png",
  },
  "foldable-travel-scooter": {
    slug: "foldable-travel-scooter",
    categorySlug: "mobility-scooters",
    name: "Foldable Travel Scooter",
    shortDesc: "Folds in seconds, fits car trunks & cruise cabins. Airline-approved.",
    price: 150,
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/mobility-scooter-acropolis-athens.png",
  },
  "foldable-power-wheelchair": {
    slug: "foldable-power-wheelchair",
    categorySlug: "power-wheelchairs",
    name: "Foldable Power Wheelchair",
    shortDesc: "Joystick control, all-day battery, folds flat for transport.",
    price: 150,
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/wheelchair-rental-plaka-athens.png",
  },
  "rollator-walker": {
    slug: "rollator-walker",
    categorySlug: "walking-aids",
    name: "Rollator Walker",
    shortDesc: "4 wheels with seat & basket. Height-adjustable, folds for transport.",
    price: 49,
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/rollator-walker-piraeus-harbor.png",
  },
};

export function getEquipmentMeta(slug: string): EquipmentMeta | null {
  return equipmentCatalog[slug] ?? null;
}
