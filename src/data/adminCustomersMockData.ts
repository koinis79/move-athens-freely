import { mockBookings, type MockBooking } from "./adminDashboardMockData";

export interface CustomerNote {
  id: string;
  timestamp: string;
  author: string;
  text: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  countryCode: string;
  language: string;
  memberSince: string;
  notes: CustomerNote[];
}

const customers: Customer[] = [
  {
    id: "c1",
    name: "Sarah Mitchell",
    email: "sarah.m@gmail.com",
    phone: "+44 7911 123456",
    nationality: "British",
    countryCode: "GB",
    language: "English",
    memberSince: "2025-06-12",
    notes: [
      { id: "cn1", timestamp: "2025-11-10T09:00:00Z", author: "Nikos K.", text: "Repeat customer — always tips delivery driver. Prefers morning deliveries." },
    ],
  },
  {
    id: "c2",
    name: "Hans Weber",
    email: "hans.w@web.de",
    phone: "+49 151 23456789",
    nationality: "German",
    countryCode: "DE",
    language: "German",
    memberSince: "2025-09-03",
    notes: [
      { id: "cn2", timestamp: "2025-10-15T14:00:00Z", author: "Nikos K.", text: "Speaks limited English. Use Google Translate or German-speaking staff." },
    ],
  },
  {
    id: "c3",
    name: "Maria Rossi",
    email: "maria.rossi@libero.it",
    phone: "+39 333 1234567",
    nationality: "Italian",
    countryCode: "IT",
    language: "Italian",
    memberSince: "2025-10-20",
    notes: [],
  },
  {
    id: "c4",
    name: "James O'Brien",
    email: "james.ob@outlook.com",
    phone: "+353 87 1234567",
    nationality: "Irish",
    countryCode: "IE",
    language: "English",
    memberSince: "2026-01-05",
    notes: [
      { id: "cn3", timestamp: "2026-01-05T10:00:00Z", author: "System", text: "Customer requires heavy-duty equipment (120kg+). Ensure correct model." },
    ],
  },
  {
    id: "c5",
    name: "Élise Moreau",
    email: "elise.m@orange.fr",
    phone: "+33 6 12 34 56 78",
    nationality: "French",
    countryCode: "FR",
    language: "French",
    memberSince: "2025-08-18",
    notes: [],
  },
  {
    id: "c6",
    name: "Robert Johnson",
    email: "rob.johnson@gmail.com",
    phone: "+1 415 555 0142",
    nationality: "American",
    countryCode: "US",
    language: "English",
    memberSince: "2026-02-10",
    notes: [
      { id: "cn4", timestamp: "2026-02-10T16:30:00Z", author: "Nikos K.", text: "Accessible room on ground floor. Side entrance for delivery." },
    ],
  },
  {
    id: "c7",
    name: "Yuki Tanaka",
    email: "yuki.t@yahoo.co.jp",
    phone: "+81 90 1234 5678",
    nationality: "Japanese",
    countryCode: "JP",
    language: "Japanese",
    memberSince: "2025-12-01",
    notes: [],
  },
  {
    id: "c8",
    name: "Anna Kowalski",
    email: "anna.k@wp.pl",
    phone: "+48 512 345 678",
    nationality: "Polish",
    countryCode: "PL",
    language: "Polish",
    memberSince: "2025-11-14",
    notes: [],
  },
  {
    id: "c9",
    name: "David Chen",
    email: "d.chen@gmail.com",
    phone: "+86 138 0013 8000",
    nationality: "Chinese",
    countryCode: "CN",
    language: "Mandarin",
    memberSince: "2026-01-22",
    notes: [
      { id: "cn5", timestamp: "2026-01-22T11:00:00Z", author: "Nikos K.", text: "WeChat contact preferred. Translation app may be needed." },
    ],
  },
  {
    id: "c10",
    name: "Margaret Thompson",
    email: "m.thompson@btinternet.com",
    phone: "+44 7700 900456",
    nationality: "British",
    countryCode: "GB",
    language: "English",
    memberSince: "2025-05-30",
    notes: [
      { id: "cn6", timestamp: "2025-11-20T13:00:00Z", author: "Dimitris P.", text: "Lovely customer. Left a 5-star review after last visit." },
    ],
  },
  {
    id: "c11",
    name: "Pierre Dupont",
    email: "pierre.d@sfr.fr",
    phone: "+33 7 56 78 90 12",
    nationality: "French",
    countryCode: "FR",
    language: "French",
    memberSince: "2026-03-01",
    notes: [
      { id: "cn7", timestamp: "2026-03-01T10:00:00Z", author: "Nikos K.", text: "VIP — referred by hotel GM at Divani Caravel. Extra care with delivery." },
    ],
  },
  {
    id: "c12",
    name: "Emma Johansson",
    email: "emma.j@telia.se",
    phone: "+46 70 123 45 67",
    nationality: "Swedish",
    countryCode: "SE",
    language: "Swedish",
    memberSince: "2026-02-20",
    notes: [],
  },
];

// Map customer names to mock bookings
const nameToCustomerId: Record<string, string> = {};
customers.forEach((c) => {
  nameToCustomerId[c.name] = c.id;
});

export function getCustomerBookings(customerId: string): MockBooking[] {
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return [];
  return mockBookings.filter((b) => b.customerName === customer.name);
}

export function getCustomerStats(customerId: string) {
  const bookings = getCustomerBookings(customerId);
  const totalSpent = bookings.reduce((sum, b) => sum + b.amount, 0);
  const lastBooking = bookings.length > 0
    ? bookings.sort((a, b) => b.startDate.localeCompare(a.startDate))[0].startDate
    : null;
  const hasActiveRental = bookings.some(
    (b) => b.status === "delivered" || b.status === "confirmed"
  );
  return { totalBookings: bookings.length, totalSpent, lastBooking, hasActiveRental };
}

export const COUNTRY_FLAGS: Record<string, string> = {
  GB: "🇬🇧", DE: "🇩🇪", IT: "🇮🇹", IE: "🇮🇪", FR: "🇫🇷",
  US: "🇺🇸", JP: "🇯🇵", PL: "🇵🇱", CN: "🇨🇳", ES: "🇪🇸",
  SE: "🇸🇪", DK: "🇩🇰", AU: "🇦🇺", UN: "🏳️",
};

export const getFlag = (code: string) => COUNTRY_FLAGS[code] ?? "🏳️";

export { customers };
