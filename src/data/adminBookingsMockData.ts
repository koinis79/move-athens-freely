// Extended mock data for the bookings management page
import { type BookingStatus, type MockBooking, mockBookings } from "./adminDashboardMockData";

export interface BookingDetail extends MockBooking {
  nationality: string;
  countryCode: string;
  deliveryArea: string;
  deliveryAddress: string;
  deliveryTime: string;
  specialInstructions: string;
  dailyRate: number;
  numDays: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "partial" | "refunded";
  createdAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  pickedUpAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  notes: ActivityNote[];
}

export interface ActivityNote {
  id: string;
  timestamp: string;
  author: string;
  text: string;
}

const today = new Date();
const fmt = (d: Date) => d.toISOString();
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const addHours = (d: Date, h: number) => {
  const r = new Date(d);
  r.setHours(r.getHours() + h);
  return r;
};

const detailsMap: Record<string, Omit<BookingDetail, keyof MockBooking>> = {
  b1: {
    nationality: "British",
    countryCode: "GB",
    deliveryArea: "Syntagma",
    deliveryAddress: "Hotel Grande Bretagne, Vasileos Georgiou A' 1, Syntagma Square",
    deliveryTime: "08:30 - 10:00",
    specialInstructions: "Please deliver to concierge desk. Guest arrives late evening the night before.",
    dailyRate: 35,
    numDays: 5,
    paymentMethod: "Credit Card (Visa)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -3)),
    confirmedAt: fmt(addDays(today, -2)),
    deliveredAt: fmt(today),
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n1", timestamp: fmt(addDays(today, -3)), author: "System", text: "Booking created via website." },
      { id: "n2", timestamp: fmt(addDays(today, -2)), author: "Nikos K.", text: "Confirmed with customer via email. Payment received." },
      { id: "n3", timestamp: fmt(today), author: "Dimitris P.", text: "Delivered to hotel concierge at 08:45. Signed by front desk." },
    ],
  },
  b2: {
    nationality: "German",
    countryCode: "DE",
    deliveryArea: "Plaka",
    deliveryAddress: "Electra Palace Athens, Navarchou Nikodimou 18-20, Plaka",
    deliveryTime: "15:00 - 17:00",
    specialInstructions: "Customer has limited English, speaks German. Battery must be fully charged.",
    dailyRate: 45,
    numDays: 7,
    paymentMethod: "PayPal",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -1)),
    confirmedAt: fmt(today),
    deliveredAt: null,
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n4", timestamp: fmt(addDays(today, -1)), author: "System", text: "Booking created via website." },
      { id: "n5", timestamp: fmt(today), author: "Nikos K.", text: "Confirmed. Delivery scheduled for this afternoon." },
    ],
  },
  b3: {
    nationality: "Italian",
    countryCode: "IT",
    deliveryArea: "Psyrri",
    deliveryAddress: "Athens Was Hotel, Dionysiou Areopagitou 5, Psyrri",
    deliveryTime: "10:00 - 12:00",
    specialInstructions: "",
    dailyRate: 25,
    numDays: 4,
    paymentMethod: "Credit Card (Mastercard)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -4)),
    confirmedAt: fmt(addDays(today, -3)),
    deliveredAt: fmt(addDays(today, -1)),
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n6", timestamp: fmt(addDays(today, -4)), author: "System", text: "Booking created via phone call." },
      { id: "n7", timestamp: fmt(addDays(today, -1)), author: "Dimitris P.", text: "Delivered to room 412." },
    ],
  },
  b4: {
    nationality: "Irish",
    countryCode: "IE",
    deliveryArea: "Syntagma",
    deliveryAddress: "King George Hotel, Vasileos Georgiou A' 3, Syntagma",
    deliveryTime: "09:00 - 11:00",
    specialInstructions: "Needs ramp access. Guest is 120kg, ensure heavy-duty model.",
    dailyRate: 58,
    numDays: 9,
    paymentMethod: "Bank Transfer",
    paymentStatus: "pending",
    createdAt: fmt(today),
    confirmedAt: null,
    deliveredAt: null,
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n8", timestamp: fmt(today), author: "System", text: "Booking created via website. Awaiting payment confirmation." },
    ],
  },
  b5: {
    nationality: "French",
    countryCode: "FR",
    deliveryArea: "Syntagma",
    deliveryAddress: "NJV Athens Plaza, Vasileos Georgiou A' 2, Syntagma",
    deliveryTime: "14:00 - 16:00",
    specialInstructions: "Guest speaks French only. Contact hotel reception for coordination.",
    dailyRate: 35,
    numDays: 4,
    paymentMethod: "Credit Card (Visa)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -5)),
    confirmedAt: fmt(addDays(today, -4)),
    deliveredAt: fmt(addDays(today, -2)),
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n9", timestamp: fmt(addDays(today, -5)), author: "System", text: "Booking created via website." },
      { id: "n10", timestamp: fmt(addDays(today, -2)), author: "Dimitris P.", text: "Delivered. Guest was very pleased." },
    ],
  },
  b6: {
    nationality: "American",
    countryCode: "US",
    deliveryArea: "Monastiraki",
    deliveryAddress: "Hermes Hotel, Apollonos 19, Monastiraki",
    deliveryTime: "10:00 - 12:00",
    specialInstructions: "Accessible room on ground floor. Delivery through side entrance.",
    dailyRate: 65,
    numDays: 6,
    paymentMethod: "Credit Card (Amex)",
    paymentStatus: "pending",
    createdAt: fmt(today),
    confirmedAt: null,
    deliveredAt: null,
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n11", timestamp: fmt(today), author: "System", text: "Booking request received. Awaiting deposit." },
    ],
  },
  b7: {
    nationality: "Japanese",
    countryCode: "JP",
    deliveryArea: "Plaka",
    deliveryAddress: "Plaka Hotel, Mitropoleos 7, Plaka",
    deliveryTime: "10:00 - 12:00",
    specialInstructions: "",
    dailyRate: 25,
    numDays: 3,
    paymentMethod: "Credit Card (Visa)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -6)),
    confirmedAt: fmt(addDays(today, -5)),
    deliveredAt: fmt(addDays(today, -3)),
    pickedUpAt: fmt(today),
    completedAt: fmt(today),
    cancelledAt: null,
    notes: [
      { id: "n12", timestamp: fmt(addDays(today, -6)), author: "System", text: "Booking created via website." },
      { id: "n13", timestamp: fmt(today), author: "Dimitris P.", text: "Picked up from hotel. Equipment in good condition." },
    ],
  },
  b8: {
    nationality: "Polish",
    countryCode: "PL",
    deliveryArea: "Acropolis",
    deliveryAddress: "Acropolis Hill Hotel, Mousson 7, Filopappou",
    deliveryTime: "09:00 - 11:00",
    specialInstructions: "Steep hill access — use van for delivery.",
    dailyRate: 45,
    numDays: 5,
    paymentMethod: "Credit Card (Mastercard)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -3)),
    confirmedAt: fmt(addDays(today, -2)),
    deliveredAt: fmt(addDays(today, -1)),
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n14", timestamp: fmt(addDays(today, -3)), author: "System", text: "Booking created via phone." },
      { id: "n15", timestamp: fmt(addDays(today, -1)), author: "Dimitris P.", text: "Delivered. Tight access but managed fine." },
    ],
  },
  b9: {
    nationality: "Chinese",
    countryCode: "CN",
    deliveryArea: "Syntagma",
    deliveryAddress: "Hotel Amalia, Amalias 10, Syntagma",
    deliveryTime: "11:00 - 13:00",
    specialInstructions: "WeChat contact preferred. Translation app may be needed.",
    dailyRate: 55,
    numDays: 5,
    paymentMethod: "Credit Card (UnionPay)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -1)),
    confirmedAt: fmt(today),
    deliveredAt: null,
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n16", timestamp: fmt(addDays(today, -1)), author: "System", text: "Booking created via email inquiry." },
      { id: "n17", timestamp: fmt(today), author: "Nikos K.", text: "Payment confirmed. Scheduled delivery for tomorrow." },
    ],
  },
  b10: {
    nationality: "British",
    countryCode: "GB",
    deliveryArea: "Plaka",
    deliveryAddress: "Electra Metropolis, Mitropoleos 15, Syntagma",
    deliveryTime: "08:00 - 10:00",
    specialInstructions: "",
    dailyRate: 35,
    numDays: 3,
    paymentMethod: "Credit Card (Visa)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -7)),
    confirmedAt: fmt(addDays(today, -6)),
    deliveredAt: fmt(addDays(today, -4)),
    pickedUpAt: fmt(addDays(today, -1)),
    completedAt: fmt(addDays(today, -1)),
    cancelledAt: null,
    notes: [
      { id: "n18", timestamp: fmt(addDays(today, -7)), author: "System", text: "Booking created via website." },
      { id: "n19", timestamp: fmt(addDays(today, -1)), author: "Dimitris P.", text: "Completed. Customer left a 5-star review." },
    ],
  },
  b11: {
    nationality: "French",
    countryCode: "FR",
    deliveryArea: "Kolonaki",
    deliveryAddress: "Divani Caravel, Vasileos Alexandrou 2, Kolonaki",
    deliveryTime: "14:00 - 16:00",
    specialInstructions: "VIP customer — referred by hotel GM. Extra care with delivery.",
    dailyRate: 75,
    numDays: 9,
    paymentMethod: "Bank Transfer",
    paymentStatus: "pending",
    createdAt: fmt(today),
    confirmedAt: null,
    deliveredAt: null,
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n20", timestamp: fmt(today), author: "System", text: "Booking created via hotel referral." },
      { id: "n21", timestamp: fmt(today), author: "Nikos K.", text: "High-value booking. Follow up on payment today." },
    ],
  },
  b12: {
    nationality: "Danish",
    countryCode: "DK",
    deliveryArea: "Omonia",
    deliveryAddress: "Central Athens Hotel, Athinas 34, Omonia",
    deliveryTime: "09:00 - 11:00",
    specialInstructions: "",
    dailyRate: 25,
    numDays: 2,
    paymentMethod: "Credit Card (Mastercard)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -3)),
    confirmedAt: fmt(addDays(today, -2)),
    deliveredAt: fmt(addDays(today, -1)),
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n22", timestamp: fmt(addDays(today, -3)), author: "System", text: "Booking created via website." },
    ],
  },
  b13: {
    nationality: "Spanish",
    countryCode: "ES",
    deliveryArea: "Omonia",
    deliveryAddress: "Titania Hotel, Panepistimiou 52, Omonia",
    deliveryTime: "10:00 - 12:00",
    specialInstructions: "Customer speaks Spanish. Pickup from lobby.",
    dailyRate: 65,
    numDays: 3,
    paymentMethod: "Credit Card (Visa)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -8)),
    confirmedAt: fmt(addDays(today, -7)),
    deliveredAt: fmt(addDays(today, -5)),
    pickedUpAt: fmt(addDays(today, -2)),
    completedAt: fmt(addDays(today, -2)),
    cancelledAt: null,
    notes: [
      { id: "n23", timestamp: fmt(addDays(today, -8)), author: "System", text: "Booking created via website." },
      { id: "n24", timestamp: fmt(addDays(today, -2)), author: "Dimitris P.", text: "Completed. Minor scratch on front wheel — noted for maintenance." },
    ],
  },
  b14: {
    nationality: "Swedish",
    countryCode: "SE",
    deliveryArea: "Kerameikos",
    deliveryAddress: "Athens Tiare Hotel, Pireos 27, Kerameikos",
    deliveryTime: "09:00 - 11:00",
    specialInstructions: "",
    dailyRate: 40,
    numDays: 4,
    paymentMethod: "Credit Card (Visa)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -2)),
    confirmedAt: fmt(addDays(today, -1)),
    deliveredAt: null,
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n25", timestamp: fmt(addDays(today, -2)), author: "System", text: "Booking created via website." },
      { id: "n26", timestamp: fmt(addDays(today, -1)), author: "Nikos K.", text: "Confirmed. Delivery scheduled for tomorrow morning." },
    ],
  },
  b15: {
    nationality: "American",
    countryCode: "US",
    deliveryArea: "Monastiraki",
    deliveryAddress: "Ava Hotel & Suites, Lysikratous 9, Monastiraki",
    deliveryTime: "10:00 - 12:00",
    specialInstructions: "Customer requested cancellation due to change in travel plans.",
    dailyRate: 70,
    numDays: 3,
    paymentMethod: "Credit Card (Mastercard)",
    paymentStatus: "refunded",
    createdAt: fmt(addDays(today, -4)),
    confirmedAt: fmt(addDays(today, -3)),
    deliveredAt: null,
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: fmt(addDays(today, -2)),
    notes: [
      { id: "n27", timestamp: fmt(addDays(today, -4)), author: "System", text: "Booking created via website." },
      { id: "n28", timestamp: fmt(addDays(today, -2)), author: "Nikos K.", text: "Customer called to cancel. Full refund processed." },
    ],
  },
  b16: {
    nationality: "French",
    countryCode: "FR",
    deliveryArea: "Psyrri",
    deliveryAddress: "Fresh Hotel Athens, Sofokleous 26, Psyrri",
    deliveryTime: "09:30 - 11:00",
    specialInstructions: "Room on 3rd floor. Elevator available.",
    dailyRate: 75,
    numDays: 3,
    paymentMethod: "Credit Card (Visa)",
    paymentStatus: "paid",
    createdAt: fmt(addDays(today, -2)),
    confirmedAt: fmt(addDays(today, -1)),
    deliveredAt: fmt(today),
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [
      { id: "n29", timestamp: fmt(addDays(today, -2)), author: "System", text: "Booking created via website." },
      { id: "n30", timestamp: fmt(today), author: "Dimitris P.", text: "Delivered to room 305. Guest was waiting." },
    ],
  },
};

export const bookingDetails: BookingDetail[] = mockBookings.map((b) => ({
  ...b,
  ...(detailsMap[b.id] ?? {
    nationality: "Unknown",
    countryCode: "UN",
    deliveryArea: "Athens Center",
    deliveryAddress: b.hotel,
    deliveryTime: "10:00 - 12:00",
    specialInstructions: "",
    dailyRate: Math.round(b.amount / 3),
    numDays: 3,
    paymentMethod: "Credit Card",
    paymentStatus: "paid" as const,
    createdAt: fmt(addDays(today, -3)),
    confirmedAt: null,
    deliveredAt: null,
    pickedUpAt: null,
    completedAt: null,
    cancelledAt: null,
    notes: [],
  }),
}));

// Country flag emoji helper
const COUNTRY_FLAGS: Record<string, string> = {
  GB: "🇬🇧", DE: "🇩🇪", IT: "🇮🇹", IE: "🇮🇪", FR: "🇫🇷",
  US: "🇺🇸", JP: "🇯🇵", PL: "🇵🇱", CN: "🇨🇳", ES: "🇪🇸",
  SE: "🇸🇪", DK: "🇩🇰", UN: "🏳️",
};

export const getFlag = (code: string) => COUNTRY_FLAGS[code] ?? "🏳️";
