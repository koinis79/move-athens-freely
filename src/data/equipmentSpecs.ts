export interface SpecItem {
  label: string;
  value: string;
  icon: string;
}

export interface EquipmentDetails {
  slug: string;
  longDescription: string;
  pricePerMonth: number;
  specs: SpecItem[];
  included: string[];
  images: string[]; // placeholder URLs
}

/** Mock detailed data keyed by slug */
export const equipmentDetailsMap: Record<string, EquipmentDetails> = {
  "lightweight-folding-wheelchair": {
    slug: "lightweight-folding-wheelchair",
    longDescription:
      "Our most popular rental — this ultra-light aluminium wheelchair folds flat in seconds, making it perfect for travel, taxis, and navigating Athens' historic streets. Comfortable padded seat and backrest with adjustable footrests.",
    pricePerMonth: 200,
    specs: [
      { label: "Weight Capacity", value: "120 kg", icon: "Weight" },
      { label: "Product Weight", value: "12 kg", icon: "Package" },
      { label: "Seat Width", value: "46 cm", icon: "Ruler" },
      { label: "Foldable", value: "Yes", icon: "FoldVertical" },
      { label: "Armrests", value: "Removable", icon: "Armchair" },
      { label: "Footrests", value: "Swing-away", icon: "Footprints" },
      { label: "Wheel Type", value: "Pneumatic", icon: "Circle" },
      { label: "Brakes", value: "Push-lock", icon: "ShieldCheck" },
    ],
    included: [
      "Equipment (sanitized & inspected)",
      "Safety manual & quick-start guide",
      "Carrying bag",
      "Phone holder",
      "Free sanitization before & after rental",
    ],
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
    ],
  },
  "heavy-duty-wheelchair-150kg": {
    slug: "heavy-duty-wheelchair-150kg",
    longDescription:
      "Reinforced steel frame supporting up to 150 kg with extra-wide padded seating for maximum comfort on longer outings.",
    pricePerMonth: 280,
    specs: [
      { label: "Weight Capacity", value: "150 kg", icon: "Weight" },
      { label: "Product Weight", value: "18 kg", icon: "Package" },
      { label: "Seat Width", value: "52 cm", icon: "Ruler" },
      { label: "Foldable", value: "Yes", icon: "FoldVertical" },
      { label: "Armrests", value: "Fixed padded", icon: "Armchair" },
      { label: "Footrests", value: "Swing-away", icon: "Footprints" },
      { label: "Wheel Type", value: "Solid rubber", icon: "Circle" },
      { label: "Brakes", value: "Push-lock", icon: "ShieldCheck" },
    ],
    included: [
      "Equipment (sanitized & inspected)",
      "Safety manual & quick-start guide",
      "Carrying bag",
      "Free sanitization before & after rental",
    ],
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  "compact-power-wheelchair": {
    slug: "compact-power-wheelchair",
    longDescription:
      "Joystick-controlled electric wheelchair ideal for city exploration. Compact turning radius and long-lasting battery for a full day out in Athens.",
    pricePerMonth: 700,
    specs: [
      { label: "Weight Capacity", value: "120 kg", icon: "Weight" },
      { label: "Product Weight", value: "35 kg", icon: "Package" },
      { label: "Seat Width", value: "46 cm", icon: "Ruler" },
      { label: "Foldable", value: "No", icon: "FoldVertical" },
      { label: "Battery Range", value: "25 km", icon: "Battery" },
      { label: "Top Speed", value: "6 km/h", icon: "Gauge" },
      { label: "Wheel Type", value: "Pneumatic", icon: "Circle" },
      { label: "Brakes", value: "Electronic", icon: "ShieldCheck" },
    ],
    included: [
      "Equipment (sanitized & inspected)",
      "Battery charger",
      "Safety manual & quick-start guide",
      "Phone holder",
      "Free sanitization before & after rental",
    ],
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
};

/** Fallback details for items without specific data */
export const defaultDetails: EquipmentDetails = {
  slug: "",
  longDescription: "High-quality mobility equipment available for rent in Athens. Contact us for more information.",
  pricePerMonth: 0,
  specs: [
    { label: "Weight Capacity", value: "120 kg", icon: "Weight" },
    { label: "Product Weight", value: "12 kg", icon: "Package" },
    { label: "Seat Width", value: "46 cm", icon: "Ruler" },
    { label: "Foldable", value: "Yes", icon: "FoldVertical" },
    { label: "Armrests", value: "Removable", icon: "Armchair" },
    { label: "Footrests", value: "Swing-away", icon: "Footprints" },
    { label: "Wheel Type", value: "Pneumatic", icon: "Circle" },
    { label: "Brakes", value: "Push-lock", icon: "ShieldCheck" },
  ],
  included: [
    "Equipment (sanitized & inspected)",
    "Safety manual & quick-start guide",
    "Carrying bag",
    "Free sanitization before & after rental",
  ],
  images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
};
