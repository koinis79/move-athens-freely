export type InventoryStatus = "available" | "rented" | "maintenance" | "retired";
export type InventoryCategory = "Wheelchairs" | "Scooters" | "Rollators" | "Accessories";
export type ConditionRating = "Excellent" | "Good" | "Fair" | "Poor";

export interface MaintenanceEntry {
  date: string;
  notes: string;
}

export interface RentalHistoryEntry {
  bookingId: string;
  customer: string;
  start: string;
  end: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  status: InventoryStatus;
  dailyRate: number;
  weeklyRate: number;
  depositAmount: number;
  description: string;
  condition: ConditionRating;
  totalRentals: number;
  currentRenter: string | null;
  returnDate: string | null;
  internalNotes: string;
  maintenanceLog: MaintenanceEntry[];
  rentalHistory: RentalHistoryEntry[];
}

export const inventoryItems: InventoryItem[] = [
  // ── Wheelchairs (4) ──
  {
    id: "EQ-001",
    name: "Lightweight Folding Wheelchair",
    category: "Wheelchairs",
    status: "rented",
    dailyRate: 10,
    weeklyRate: 60,
    depositAmount: 50,
    description: "Ultra-light aluminium frame, folds compactly for travel and storage. Ideal for short stays.",
    condition: "Good",
    totalRentals: 47,
    currentRenter: "Maria Schneider",
    returnDate: "2026-03-17",
    internalNotes: "Most popular item. Check wheel bearings after every 10 rentals.",
    maintenanceLog: [
      { date: "2026-02-10", notes: "Replaced front caster wheels" },
      { date: "2025-11-22", notes: "Full inspection — all clear" },
    ],
    rentalHistory: [
      { bookingId: "MOV-20260312-004", customer: "Maria Schneider", start: "2026-03-12", end: "2026-03-17" },
      { bookingId: "MOV-20260301-008", customer: "James Wilson", start: "2026-03-01", end: "2026-03-05" },
      { bookingId: "MOV-20260215-011", customer: "Sophie Laurent", start: "2026-02-15", end: "2026-02-20" },
    ],
  },
  {
    id: "EQ-002",
    name: "Heavy-Duty Wheelchair (150kg)",
    category: "Wheelchairs",
    status: "available",
    dailyRate: 15,
    weeklyRate: 85,
    depositAmount: 80,
    description: "Reinforced steel frame supporting up to 150 kg with extra-padded seating and armrests.",
    condition: "Excellent",
    totalRentals: 22,
    currentRenter: null,
    returnDate: null,
    internalNotes: "Heavier to deliver — always send with the van.",
    maintenanceLog: [
      { date: "2026-01-15", notes: "Lubricated axle bearings" },
    ],
    rentalHistory: [
      { bookingId: "MOV-20260225-003", customer: "Robert Müller", start: "2026-02-25", end: "2026-03-02" },
    ],
  },
  {
    id: "EQ-003",
    name: "Transport Wheelchair",
    category: "Wheelchairs",
    status: "available",
    dailyRate: 8,
    weeklyRate: 45,
    depositAmount: 40,
    description: "Companion-pushed transport chair, ultra-compact and lightweight for airport transfers.",
    condition: "Good",
    totalRentals: 31,
    currentRenter: null,
    returnDate: null,
    internalNotes: "",
    maintenanceLog: [],
    rentalHistory: [
      { bookingId: "MOV-20260305-006", customer: "Elena Papadopoulos", start: "2026-03-05", end: "2026-03-08" },
    ],
  },
  {
    id: "EQ-004",
    name: "Pediatric Wheelchair",
    category: "Wheelchairs",
    status: "maintenance",
    dailyRate: 12,
    weeklyRate: 65,
    depositAmount: 60,
    description: "Adjustable paediatric wheelchair for children aged 5-14, colourful design.",
    condition: "Fair",
    totalRentals: 14,
    currentRenter: null,
    returnDate: null,
    internalNotes: "Left footrest needs replacement — ordered part on Mar 10.",
    maintenanceLog: [
      { date: "2026-03-10", notes: "Left footrest broken — part ordered" },
      { date: "2025-12-01", notes: "Full refurbishment, new upholstery" },
    ],
    rentalHistory: [
      { bookingId: "MOV-20260220-009", customer: "Anna Berger", start: "2026-02-20", end: "2026-02-24" },
    ],
  },

  // ── Mobility Scooters (3) ──
  {
    id: "EQ-005",
    name: "Portable Travel Scooter",
    category: "Scooters",
    status: "rented",
    dailyRate: 25,
    weeklyRate: 150,
    depositAmount: 120,
    description: "Lightweight foldable scooter that fits in most car trunks and taxis. 20km range.",
    condition: "Excellent",
    totalRentals: 38,
    currentRenter: "Thomas & Helga Braun",
    returnDate: "2026-03-16",
    internalNotes: "Charge battery fully before each delivery. Comes with charger + manual.",
    maintenanceLog: [
      { date: "2026-02-28", notes: "Battery health check — 94% capacity" },
    ],
    rentalHistory: [
      { bookingId: "MOV-20260313-002", customer: "Thomas Braun", start: "2026-03-13", end: "2026-03-16" },
      { bookingId: "MOV-20260302-005", customer: "Claire Dubois", start: "2026-03-02", end: "2026-03-06" },
    ],
  },
  {
    id: "EQ-006",
    name: "4-Wheel Mobility Scooter",
    category: "Scooters",
    status: "available",
    dailyRate: 30,
    weeklyRate: 180,
    depositAmount: 150,
    description: "Stable four-wheel scooter with suspension, ideal for full-day sightseeing.",
    condition: "Good",
    totalRentals: 29,
    currentRenter: null,
    returnDate: null,
    internalNotes: "Front basket included. Remind customers about the horn.",
    maintenanceLog: [
      { date: "2026-01-20", notes: "Replaced rear tyres" },
      { date: "2025-10-15", notes: "Full electrical check" },
    ],
    rentalHistory: [
      { bookingId: "MOV-20260228-007", customer: "John Peterson", start: "2026-02-28", end: "2026-03-04" },
    ],
  },
  {
    id: "EQ-007",
    name: "Heavy-Duty Scooter (180kg)",
    category: "Scooters",
    status: "rented",
    dailyRate: 35,
    weeklyRate: 210,
    depositAmount: 180,
    description: "High-capacity scooter supporting up to 180kg, extended 30km battery range.",
    condition: "Good",
    totalRentals: 18,
    currentRenter: "Hans Weber",
    returnDate: "2026-03-20",
    internalNotes: "Needs van delivery due to weight (45kg).",
    maintenanceLog: [
      { date: "2026-03-01", notes: "Firmware update applied" },
    ],
    rentalHistory: [
      { bookingId: "MOV-20260314-001", customer: "Hans Weber", start: "2026-03-14", end: "2026-03-20" },
    ],
  },

  // ── Rollators (3) ──
  {
    id: "EQ-008",
    name: "Standard Rollator with Seat",
    category: "Rollators",
    status: "available",
    dailyRate: 5,
    weeklyRate: 30,
    depositAmount: 25,
    description: "Four-wheeled rollator with built-in seat, shopping basket, and hand brakes.",
    condition: "Good",
    totalRentals: 52,
    currentRenter: null,
    returnDate: null,
    internalNotes: "Best seller for elderly tourists. Check brakes before each rental.",
    maintenanceLog: [
      { date: "2026-02-15", notes: "Adjusted brake cables" },
    ],
    rentalHistory: [
      { bookingId: "MOV-20260308-010", customer: "Dorothy Stevens", start: "2026-03-08", end: "2026-03-12" },
    ],
  },
  {
    id: "EQ-009",
    name: "Lightweight Carbon Rollator",
    category: "Rollators",
    status: "rented",
    dailyRate: 8,
    weeklyRate: 45,
    depositAmount: 40,
    description: "Premium carbon-fibre rollator, extremely light yet durable. Folds flat for storage.",
    condition: "Excellent",
    totalRentals: 19,
    currentRenter: "Margaret Ellis",
    returnDate: "2026-03-15",
    internalNotes: "Premium item — handle with care. Comes with travel bag.",
    maintenanceLog: [],
    rentalHistory: [
      { bookingId: "MOV-20260312-012", customer: "Margaret Ellis", start: "2026-03-12", end: "2026-03-15" },
    ],
  },
  {
    id: "EQ-010",
    name: "Compact Indoor Rollator",
    category: "Rollators",
    status: "available",
    dailyRate: 5,
    weeklyRate: 28,
    depositAmount: 20,
    description: "Narrow-frame rollator designed for indoor use in hotels and restaurants.",
    condition: "Fair",
    totalRentals: 35,
    currentRenter: null,
    returnDate: null,
    internalNotes: "Right rear wheel has slight wobble — monitor.",
    maintenanceLog: [
      { date: "2026-03-05", notes: "Tightened rear wheel assembly" },
    ],
    rentalHistory: [],
  },

  // ── Accessories (4) ──
  {
    id: "EQ-011",
    name: "Forearm Crutches (Pair)",
    category: "Accessories",
    status: "available",
    dailyRate: 4,
    weeklyRate: 20,
    depositAmount: 15,
    description: "Adjustable aluminium forearm crutches, ergonomic grip, anti-slip tips.",
    condition: "Good",
    totalRentals: 61,
    currentRenter: null,
    returnDate: null,
    internalNotes: "Always provide both + spare rubber tips.",
    maintenanceLog: [],
    rentalHistory: [
      { bookingId: "MOV-20260310-013", customer: "Yuki Tanaka", start: "2026-03-10", end: "2026-03-14" },
    ],
  },
  {
    id: "EQ-012",
    name: "Portable Ramp (1.2m)",
    category: "Accessories",
    status: "rented",
    dailyRate: 10,
    weeklyRate: 55,
    depositAmount: 60,
    description: "Foldable aluminium ramp, 1.2m length, supports up to 300kg. For steps and curbs.",
    condition: "Good",
    totalRentals: 12,
    currentRenter: "Pierre & Louise Martin",
    returnDate: "2026-03-18",
    internalNotes: "Heavy item — deliver with equipment when possible.",
    maintenanceLog: [
      { date: "2026-01-08", notes: "Anti-slip surface inspected — OK" },
    ],
    rentalHistory: [
      { bookingId: "MOV-20260314-003", customer: "Pierre Martin", start: "2026-03-14", end: "2026-03-18" },
    ],
  },
  {
    id: "EQ-013",
    name: "Raised Toilet Seat",
    category: "Accessories",
    status: "available",
    dailyRate: 4,
    weeklyRate: 22,
    depositAmount: 15,
    description: "Clip-on raised toilet seat with armrests, fits most standard toilets. Sanitised after each use.",
    condition: "Excellent",
    totalRentals: 28,
    currentRenter: null,
    returnDate: null,
    internalNotes: "Deep clean + sanitise protocol between every rental.",
    maintenanceLog: [],
    rentalHistory: [],
  },
  {
    id: "EQ-014",
    name: "Shower Chair",
    category: "Accessories",
    status: "retired",
    dailyRate: 5,
    weeklyRate: 28,
    depositAmount: 20,
    description: "Adjustable-height shower chair with non-slip feet and drainage holes.",
    condition: "Poor",
    totalRentals: 44,
    currentRenter: null,
    returnDate: null,
    internalNotes: "Retired Mar 2026 — rust on legs, replacement ordered.",
    maintenanceLog: [
      { date: "2026-03-08", notes: "Retired due to rust — replacement on order" },
      { date: "2025-09-20", notes: "Anti-rust treatment applied" },
    ],
    rentalHistory: [],
  },
  {
    id: "EQ-015",
    name: "Knee Scooter",
    category: "Accessories",
    status: "available",
    dailyRate: 12,
    weeklyRate: 65,
    depositAmount: 50,
    description: "Steerable knee walker for lower-leg injuries. Adjustable handlebars and knee pad.",
    condition: "Excellent",
    totalRentals: 9,
    currentRenter: null,
    returnDate: null,
    internalNotes: "Newer item — added Jan 2026.",
    maintenanceLog: [],
    rentalHistory: [
      { bookingId: "MOV-20260306-014", customer: "Luca Rossi", start: "2026-03-06", end: "2026-03-10" },
    ],
  },
];
