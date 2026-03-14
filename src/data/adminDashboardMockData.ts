// Realistic mock data for the admin dashboard

export type BookingStatus = "pending" | "confirmed" | "delivered" | "completed" | "cancelled";

export interface MockBooking {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  equipment: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  amount: number;
  hotel: string;
  phone: string;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  type: "delivery" | "pickup";
  customerName: string;
  equipment: string;
  address: string;
}

export interface UpcomingPickup {
  id: string;
  customerName: string;
  equipment: string;
  returnDate: string;
  hotel: string;
}

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const fmtBookingId = (d: Date, seq: number) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `MOV-${y}${m}${day}-${String(seq).padStart(3, "0")}`;
};

export const mockBookings: MockBooking[] = [
  {
    id: "b1",
    bookingId: fmtBookingId(today, 1),
    customerName: "Sarah Mitchell",
    customerEmail: "sarah.m@gmail.com",
    equipment: "Lightweight Folding Wheelchair",
    startDate: fmt(today),
    endDate: fmt(addDays(today, 5)),
    status: "delivered",
    amount: 175,
    hotel: "Hotel Grande Bretagne",
    phone: "+44 7911 123456",
  },
  {
    id: "b2",
    bookingId: fmtBookingId(today, 2),
    customerName: "Hans Weber",
    customerEmail: "hans.w@web.de",
    equipment: "Portable Mobility Scooter",
    startDate: fmt(today),
    endDate: fmt(addDays(today, 7)),
    status: "confirmed",
    amount: 315,
    hotel: "Electra Palace Athens",
    phone: "+49 151 23456789",
  },
  {
    id: "b3",
    bookingId: fmtBookingId(addDays(today, -1), 3),
    customerName: "Maria Rossi",
    customerEmail: "maria.rossi@libero.it",
    equipment: "Travel Rollator",
    startDate: fmt(addDays(today, -1)),
    endDate: fmt(addDays(today, 3)),
    status: "delivered",
    amount: 95,
    hotel: "Athens Was Hotel",
    phone: "+39 333 1234567",
  },
  {
    id: "b4",
    bookingId: fmtBookingId(today, 4),
    customerName: "James O'Brien",
    customerEmail: "james.ob@outlook.com",
    equipment: "Heavy-Duty Power Wheelchair",
    startDate: fmt(addDays(today, 1)),
    endDate: fmt(addDays(today, 10)),
    status: "pending",
    amount: 520,
    hotel: "King George Hotel",
    phone: "+353 87 1234567",
  },
  {
    id: "b5",
    bookingId: fmtBookingId(addDays(today, -2), 5),
    customerName: "Élise Moreau",
    customerEmail: "elise.m@orange.fr",
    equipment: "Lightweight Folding Wheelchair",
    startDate: fmt(addDays(today, -2)),
    endDate: fmt(addDays(today, 2)),
    status: "delivered",
    amount: 140,
    hotel: "NJV Athens Plaza",
    phone: "+33 6 12 34 56 78",
  },
  {
    id: "b6",
    bookingId: fmtBookingId(today, 6),
    customerName: "Robert Johnson",
    customerEmail: "rob.johnson@gmail.com",
    equipment: "Compact Power Wheelchair",
    startDate: fmt(addDays(today, 2)),
    endDate: fmt(addDays(today, 8)),
    status: "pending",
    amount: 390,
    hotel: "Hermes Hotel",
    phone: "+1 415 555 0142",
  },
  {
    id: "b7",
    bookingId: fmtBookingId(addDays(today, -3), 7),
    customerName: "Yuki Tanaka",
    customerEmail: "yuki.t@yahoo.co.jp",
    equipment: "Travel Rollator",
    startDate: fmt(addDays(today, -3)),
    endDate: fmt(today),
    status: "completed",
    amount: 85,
    hotel: "Plaka Hotel",
    phone: "+81 90 1234 5678",
  },
  {
    id: "b8",
    bookingId: fmtBookingId(addDays(today, -1), 8),
    customerName: "Anna Kowalski",
    customerEmail: "anna.k@wp.pl",
    equipment: "4-Wheel Mobility Scooter",
    startDate: fmt(addDays(today, -1)),
    endDate: fmt(addDays(today, 4)),
    status: "delivered",
    amount: 245,
    hotel: "Acropolis Hill Hotel",
    phone: "+48 512 345 678",
  },
  {
    id: "b9",
    bookingId: fmtBookingId(today, 9),
    customerName: "David Chen",
    customerEmail: "d.chen@gmail.com",
    equipment: "Foldable Travel Scooter",
    startDate: fmt(addDays(today, 1)),
    endDate: fmt(addDays(today, 6)),
    status: "confirmed",
    amount: 275,
    hotel: "Hotel Amalia",
    phone: "+86 138 0013 8000",
  },
  {
    id: "b10",
    bookingId: fmtBookingId(addDays(today, -4), 10),
    customerName: "Margaret Thompson",
    customerEmail: "m.thompson@btinternet.com",
    equipment: "Lightweight Folding Wheelchair",
    startDate: fmt(addDays(today, -4)),
    endDate: fmt(addDays(today, -1)),
    status: "completed",
    amount: 105,
    hotel: "Electra Metropolis",
    phone: "+44 7700 900456",
  },
  {
    id: "b11",
    bookingId: fmtBookingId(today, 11),
    customerName: "Pierre Dupont",
    customerEmail: "pierre.d@sfr.fr",
    equipment: "Premium Power Wheelchair",
    startDate: fmt(addDays(today, 3)),
    endDate: fmt(addDays(today, 12)),
    status: "pending",
    amount: 680,
    hotel: "Divani Caravel",
    phone: "+33 7 56 78 90 12",
  },
  {
    id: "b12",
    bookingId: fmtBookingId(addDays(today, -1), 12),
    customerName: "Lisa Andersen",
    customerEmail: "lisa.a@gmail.com",
    equipment: "Standard Rollator",
    startDate: fmt(addDays(today, -1)),
    endDate: fmt(addDays(today, 1)),
    status: "delivered",
    amount: 55,
    hotel: "Central Athens Hotel",
    phone: "+45 20 12 34 56",
  },
  {
    id: "b13",
    bookingId: fmtBookingId(addDays(today, -5), 13),
    customerName: "Carlos García",
    customerEmail: "carlos.g@hotmail.es",
    equipment: "Portable Mobility Scooter",
    startDate: fmt(addDays(today, -5)),
    endDate: fmt(addDays(today, -2)),
    status: "completed",
    amount: 195,
    hotel: "Titania Hotel",
    phone: "+34 612 345 678",
  },
  {
    id: "b14",
    bookingId: fmtBookingId(today, 14),
    customerName: "Emma Johansson",
    customerEmail: "emma.j@telia.se",
    equipment: "Lightweight Carbon Rollator",
    startDate: fmt(today),
    endDate: fmt(addDays(today, 4)),
    status: "confirmed",
    amount: 160,
    hotel: "Athens Tiare Hotel",
    phone: "+46 70 123 45 67",
  },
  {
    id: "b15",
    bookingId: fmtBookingId(addDays(today, -2), 15),
    customerName: "Michael Brown",
    customerEmail: "m.brown@aol.com",
    equipment: "Heavy-Duty Wheelchair",
    startDate: fmt(addDays(today, -2)),
    endDate: fmt(addDays(today, 1)),
    status: "cancelled",
    amount: 210,
    hotel: "Ava Hotel & Suites",
    phone: "+1 212 555 0198",
  },
  {
    id: "b16",
    bookingId: fmtBookingId(today, 16),
    customerName: "Sophie Martin",
    customerEmail: "sophie.m@gmail.com",
    equipment: "Compact Power Wheelchair",
    startDate: fmt(today),
    endDate: fmt(addDays(today, 3)),
    status: "delivered",
    amount: 225,
    hotel: "Fresh Hotel Athens",
    phone: "+33 6 98 76 54 32",
  },
];

export const todaySchedule: ScheduleEvent[] = [
  {
    id: "s1",
    time: "08:30",
    type: "delivery",
    customerName: "Sarah Mitchell",
    equipment: "Lightweight Folding Wheelchair",
    address: "Hotel Grande Bretagne, Syntagma Sq.",
  },
  {
    id: "s2",
    time: "09:15",
    type: "delivery",
    customerName: "Emma Johansson",
    equipment: "Lightweight Carbon Rollator",
    address: "Athens Tiare Hotel, Pireos 27",
  },
  {
    id: "s3",
    time: "10:00",
    type: "delivery",
    customerName: "Sophie Martin",
    equipment: "Compact Power Wheelchair",
    address: "Fresh Hotel Athens, Sofokleous 26",
  },
  {
    id: "s4",
    time: "11:30",
    type: "pickup",
    customerName: "Yuki Tanaka",
    equipment: "Travel Rollator",
    address: "Plaka Hotel, Mitropoleos 7",
  },
  {
    id: "s5",
    time: "14:00",
    type: "pickup",
    customerName: "Margaret Thompson",
    equipment: "Lightweight Folding Wheelchair",
    address: "Electra Metropolis, Mitropoleos 15",
  },
  {
    id: "s6",
    time: "15:30",
    type: "delivery",
    customerName: "Hans Weber",
    equipment: "Portable Mobility Scooter",
    address: "Electra Palace Athens, Navarchou Nikodimou 18",
  },
  {
    id: "s7",
    time: "17:00",
    type: "pickup",
    customerName: "Carlos García",
    equipment: "Portable Mobility Scooter",
    address: "Titania Hotel, Panepistimiou 52",
  },
];

export const upcomingPickups: UpcomingPickup[] = [
  {
    id: "p1",
    customerName: "Yuki Tanaka",
    equipment: "Travel Rollator",
    returnDate: fmt(today),
    hotel: "Plaka Hotel",
  },
  {
    id: "p2",
    customerName: "Lisa Andersen",
    equipment: "Standard Rollator",
    returnDate: fmt(addDays(today, 1)),
    hotel: "Central Athens Hotel",
  },
  {
    id: "p3",
    customerName: "Michael Brown",
    equipment: "Heavy-Duty Wheelchair",
    returnDate: fmt(addDays(today, 1)),
    hotel: "Ava Hotel & Suites",
  },
  {
    id: "p4",
    customerName: "Élise Moreau",
    equipment: "Lightweight Folding Wheelchair",
    returnDate: fmt(addDays(today, 2)),
    hotel: "NJV Athens Plaza",
  },
  {
    id: "p5",
    customerName: "Maria Rossi",
    equipment: "Travel Rollator",
    returnDate: fmt(addDays(today, 3)),
    hotel: "Athens Was Hotel",
  },
  {
    id: "p6",
    customerName: "Sophie Martin",
    equipment: "Compact Power Wheelchair",
    returnDate: fmt(addDays(today, 3)),
    hotel: "Fresh Hotel Athens",
  },
  {
    id: "p7",
    customerName: "Anna Kowalski",
    equipment: "4-Wheel Mobility Scooter",
    returnDate: fmt(addDays(today, 4)),
    hotel: "Acropolis Hill Hotel",
  },
];

// Dashboard stats
export const dashboardStats = {
  activeRentals: { value: 6, change: 12 },
  todaysDeliveries: { value: 4, change: -8 },
  pendingRequests: { value: 3, change: 25 },
  todaysRevenue: { value: 1245, change: 18 },
};
