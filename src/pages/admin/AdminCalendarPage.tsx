import { useState, useMemo, type MouseEvent } from "react";
import {
  ChevronLeft, ChevronRight, Truck, PackageCheck, Plus, Calendar as CalendarIcon,
  Clock, MapPin, Phone, Euro, ShieldCheck,
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isWithinInterval, parseISO, addWeeks, subWeeks, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminBookings, type AdminBooking } from "@/hooks/useAdminBookings";
import BookingSlideOver from "@/components/admin/BookingSlideOver";
import NewBookingModal from "@/components/admin/NewBookingModal";

type ViewMode = "month" | "week" | "day";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days: Date[] = [];
  let d = start;
  while (d <= end) { days.push(d); d = addDays(d, 1); }
  return days;
}

function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function bookingSpansDate(b: AdminBooking, date: Date): boolean {
  const s = parseISO(b.rental_start);
  const e = parseISO(b.rental_end);
  return isWithinInterval(date, { start: startOfDay(s), end: endOfDay(e) });
}

function isDeliveryDay(b: AdminBooking, date: Date): boolean {
  return isSameDay(parseISO(b.rental_start), date) && b.status !== "cancelled";
}

function isPickupDay(b: AdminBooking, date: Date): boolean {
  return isSameDay(parseISO(b.rental_end), date) && b.status !== "cancelled";
}

function getLastName(name: string) {
  const parts = name.split(" ");
  return parts[parts.length - 1];
}

function getEquipmentShort(b: AdminBooking) {
  return b.booking_items?.[0]?.equipment?.name_en?.split(" ").slice(0, 2).join(" ") ?? "Equipment";
}

// A single calendar event: a delivery (🚚, on rental_start) or a collection
// (📦, on rental_end). Rendered as a calm tinted pill — brand primary-blue for
// deliveries, accent-green for collections — with the customer's surname. It's a
// div (not a button) because it sits inside the day-cell button; nested buttons
// are invalid HTML.
function EventChip({
  b, kind, onClick,
}: {
  b: AdminBooking;
  kind: "delivery" | "collection";
  onClick: (e: MouseEvent) => void;
}) {
  const isDelivery = kind === "delivery";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e as unknown as MouseEvent); } }}
      title={`${isDelivery ? "Delivery" : "Collection"}: ${getEquipmentShort(b)} — ${b.customer_name}`}
      className={cn(
        "flex items-center gap-1 w-full min-w-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none cursor-pointer transition-opacity hover:opacity-80",
        isDelivery
          ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/25 dark:text-[#93C5FD]"
          : "bg-[#65A30D]/10 text-[#65A30D] dark:bg-[#65A30D]/25 dark:text-[#A3E635]",
      )}
    >
      <span className="shrink-0 leading-none">{isDelivery ? "🚚" : "📦"}</span>
      <span className="truncate">{getLastName(b.customer_name)}</span>
    </div>
  );
}

// ─── Operations helpers ─────────────────────────────────────────
const TIME_SLOT_LABELS: Record<string, string> = {
  daytime: "Daytime (09:00–17:00)",
  evening: "Evening (17:00–21:00)",
  morning: "Morning",
  afternoon: "Afternoon",
};
function timeSlotLabel(slot: string | null): string {
  if (!slot || slot === "tbc") return "Time to confirm";
  return TIME_SLOT_LABELS[slot] ?? slot;
}

// Refundable security deposit (εγγύηση) held in person — sum of per-item
// deposit_amount × qty. Collected at delivery, returned at collection.
function securityDeposit(b: AdminBooking): number {
  return (b.booking_items ?? []).reduce(
    (s, i) => s + Number(i.equipment?.deposit_amount ?? 0) * i.quantity,
    0,
  );
}

// Cash to collect at the door on delivery, driven by payment_status.
function amountToCollect(b: AdminBooking): { amount: number; label: string; tone: "collect" | "paid" } {
  if (b.payment_status === "paid") return { amount: 0, label: "Paid in full", tone: "paid" };
  if (b.payment_status === "deposit_paid") {
    const balance = Number(b.amount_due ?? Number(b.total_amount) - Number(b.amount_paid ?? 0));
    return { amount: balance, label: `Balance due €${balance.toFixed(0)}`, tone: "collect" };
  }
  // pending / failed / unpaid → collect the full amount on delivery
  const full = Number(b.total_amount);
  return { amount: full, label: `Collect €${full.toFixed(0)}`, tone: "collect" };
}

const phoneDigits = (p: string) => p.replace(/[^0-9]/g, "");

// ─── Day Detail Panel (daily operations) ────────────────────────
function DayDetailPanel({
  date,
  bookings,
  onBookingClick,
}: {
  date: Date;
  bookings: AdminBooking[];
  onBookingClick: (b: AdminBooking) => void;
}) {
  const deliveries = bookings.filter((b) => isDeliveryDay(b, date));
  const collections = bookings.filter((b) => isPickupDay(b, date));

  const ContactRow = ({ b }: { b: AdminBooking }) => (
    <div className="flex items-center gap-2 mt-1.5">
      {b.customer_phone && (
        <>
          <a
            href={`tel:${phoneDigits(b.customer_phone)}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Phone className="h-3 w-3" /> {b.customer_phone}
          </a>
          <a
            href={`https://wa.me/${phoneDigits(b.customer_phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-xs text-green-600 hover:underline"
            title="WhatsApp"
          >
            WhatsApp
          </a>
        </>
      )}
    </div>
  );

  return (
    <div className="w-72 xl:w-80 border-l border-border bg-card p-4 overflow-y-auto flex-shrink-0">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">{format(date, "EEEE, MMM d")}</h3>
        <p className="text-xs text-muted-foreground">
          {deliveries.length} deliver{deliveries.length === 1 ? "y" : "ies"} · {collections.length} collection{collections.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── DELIVERIES ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="h-4 w-4 text-secondary" />
          <h4 className="text-sm font-bold text-foreground">Deliveries today</h4>
          <Badge variant="secondary" className="text-xs h-5 px-1.5">{deliveries.length}</Badge>
        </div>
        {deliveries.length === 0 ? (
          <p className="text-xs text-muted-foreground pl-1">No deliveries scheduled.</p>
        ) : (
          <div className="space-y-2">
            {deliveries.map((b) => {
              const collect = amountToCollect(b);
              const deposit = securityDeposit(b);
              return (
                <button
                  key={b.id}
                  onClick={() => onBookingClick(b)}
                  className="w-full text-left p-3 rounded-lg border-l-4 border-l-secondary border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground truncate">{b.customer_name}</div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" /> {timeSlotLabel(b.delivery_time_slot)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{getEquipmentShort(b)}</div>
                  {(b.delivery_zones?.name_en || b.delivery_address) && (
                    <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>
                        {b.delivery_zones?.name_en && <span className="font-medium">{b.delivery_zones.name_en}</span>}
                        {b.delivery_zones?.name_en && b.delivery_address ? " · " : ""}
                        {b.delivery_address}
                      </span>
                    </div>
                  )}
                  <ContactRow b={b} />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold",
                        collect.tone === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800",
                      )}
                    >
                      <Euro className="h-3 w-3" /> {collect.label}
                    </span>
                    {deposit > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800">
                        <ShieldCheck className="h-3 w-3" /> +€{deposit.toFixed(0)} deposit (εγγύηση)
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── COLLECTIONS ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <PackageCheck className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-bold text-foreground">Collections today</h4>
          <Badge variant="secondary" className="text-xs h-5 px-1.5">{collections.length}</Badge>
        </div>
        {collections.length === 0 ? (
          <p className="text-xs text-muted-foreground pl-1">No collections scheduled.</p>
        ) : (
          <div className="space-y-2">
            {collections.map((b) => {
              const deposit = securityDeposit(b);
              return (
                <button
                  key={b.id}
                  onClick={() => onBookingClick(b)}
                  className="w-full text-left p-3 rounded-lg border-l-4 border-l-primary border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="text-sm font-semibold text-foreground truncate">{b.customer_name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{getEquipmentShort(b)}</div>
                  {b.delivery_address && (
                    <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{b.delivery_address}</span>
                    </div>
                  )}
                  <ContactRow b={b} />
                  {deposit > 0 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800">
                        <ShieldCheck className="h-3 w-3" /> Refund €{deposit.toFixed(0)} deposit (εγγύηση)
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Calendar Page ────────────────────────────────────────
const AdminCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  const { bookings, loading, refetch } = useAdminBookings();
  const today = useMemo(() => new Date(), []);

  const navigate = (dir: -1 | 1) => {
    if (viewMode === "month") setCurrentDate((d) => (dir === 1 ? addMonths(d, 1) : subMonths(d, 1)));
    else if (viewMode === "week") setCurrentDate((d) => (dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)));
    else setCurrentDate((d) => addDays(d, dir));
  };

  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  const headerLabel = useMemo(() => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") {
      const days = getWeekDays(currentDate);
      return `${format(days[0], "MMM d")} – ${format(days[6], "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  }, [currentDate, viewMode]);

  const days = useMemo(
    () => (viewMode === "month" ? getMonthDays(currentDate) : viewMode === "week" ? getWeekDays(currentDate) : [currentDate]),
    [currentDate, viewMode]
  );

  const getBookingsForDate = (date: Date) => bookings.filter((b) => bookingSpansDate(b, date));

  // Grid shows EVENTS, not spans: cancelled + archived bookings are hidden, and
  // each remaining booking surfaces only on its delivery day and its collection
  // day — never on the days in between.
  const gridBookings = useMemo(
    () => bookings.filter((b) => !b.is_archived && b.status !== "cancelled"),
    [bookings],
  );
  const eventsOn = (date: Date) => [
    ...gridBookings
      .filter((b) => isSameDay(parseISO(b.rental_start), date))
      .map((b) => ({ b, kind: "delivery" as const })),
    ...gridBookings
      .filter((b) => isSameDay(parseISO(b.rental_end), date))
      .map((b) => ({ b, kind: "collection" as const })),
  ];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === "month" && !isSameMonth(date, currentDate)) setCurrentDate(date);
  };

  // ─── Month Cell ──────────────────────────────────────────
  const MonthCell = ({ date }: { date: Date }) => {
    const isToday = isSameDay(date, today);
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const dow = date.getDay(); // 0=Sun … 6=Sat
    const isWeekend = dow === 0 || dow === 6;
    const events = eventsOn(date);
    const shown = events.slice(0, 4);
    const extra = events.length - shown.length;

    return (
      <button
        onClick={() => handleDateClick(date)}
        className={cn(
          "relative min-h-[120px] border-b border-r border-border p-1.5 text-left align-top transition-colors hover:bg-muted/30",
          isWeekend && !isToday && "bg-muted/20",
          !isCurrentMonth && "opacity-40",
          isToday && "bg-primary/5 ring-1 ring-inset ring-primary/30",
          isSelected && !isToday && "ring-2 ring-inset ring-primary/40",
        )}
      >
        <div className="mb-1">
          <span className={cn(
            "text-xs font-semibold",
            isToday ? "text-primary" : isCurrentMonth ? "text-foreground" : "text-muted-foreground",
          )}>
            {format(date, "d")}
          </span>
        </div>
        <div className="space-y-1">
          {shown.map(({ b, kind }) => (
            <EventChip
              key={`${kind}-${b.id}`}
              b={b}
              kind={kind}
              onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
            />
          ))}
          {extra > 0 && (
            <span className="block text-[10px] text-muted-foreground pl-1">+{extra} more</span>
          )}
        </div>
      </button>
    );
  };

  // ─── Week / Day Row ──────────────────────────────────────
  const WeekDayRow = ({ date }: { date: Date }) => {
    const isToday = isSameDay(date, today);
    const isSelected = isSameDay(date, selectedDate);
    const events = eventsOn(date);

    return (
      <button
        onClick={() => handleDateClick(date)}
        className={cn(
          "flex gap-3 p-3 border-b border-border text-left transition-colors hover:bg-muted/30 w-full",
          isSelected && "bg-primary/5",
        )}
      >
        <div className="w-14 flex-shrink-0 text-center">
          <div className="text-xs text-muted-foreground">{format(date, "EEE")}</div>
          <div className={cn(
            "text-lg font-bold w-9 h-9 flex items-center justify-center rounded-full mx-auto",
            isToday ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "text-foreground",
          )}>
            {format(date, "d")}
          </div>
        </div>
        <div className="flex-1 flex flex-wrap gap-1.5 min-h-[40px] items-start content-start">
          {events.map(({ b, kind }) => (
            <div key={`${kind}-${b.id}`} className="max-w-[170px]">
              <EventChip
                b={b}
                kind={kind}
                onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
              />
            </div>
          ))}
          {events.length === 0 && <span className="text-xs text-muted-foreground italic">No events</span>}
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] gap-0">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card rounded-t-xl">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Calendar</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-muted rounded-lg p-0.5">
              {(["month", "week", "day"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                    viewMode === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>Today</Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <h2 className="text-sm font-semibold text-foreground min-w-[180px]">{headerLabel}</h2>
          </div>
          <Button
            size="sm"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-8 text-xs"
            onClick={() => setNewBookingOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> New Booking
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-card text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#2563EB]/10 text-[10px]">🚚</span>
            Delivery
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#65A30D]/10 text-[10px]">📦</span>
            Collection
          </span>
        </div>

        {/* Calendar body */}
        <div className="flex-1 overflow-auto bg-card rounded-b-xl">
          {viewMode === "month" && (
            <>
              <div className="grid grid-cols-7 border-b border-border">
                {WEEKDAYS.map((d, i) => (
                  <div
                    key={d}
                    className={cn(
                      "text-center text-xs font-semibold text-muted-foreground py-2 border-r border-border last:border-r-0",
                      i >= 5 && "bg-muted/20",
                    )}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 group">
                {days.map((date) => <MonthCell key={date.toISOString()} date={date} />)}
              </div>
            </>
          )}
          {(viewMode === "week" || viewMode === "day") && (
            <div className="divide-y divide-border">
              {days.map((date) => <WeekDayRow key={date.toISOString()} date={date} />)}
            </div>
          )}
        </div>
      </div>

      {/* Day Detail Sidebar */}
      <DayDetailPanel
        date={selectedDate}
        bookings={getBookingsForDate(selectedDate)}
        onBookingClick={(b) => setSelectedBooking(b)}
      />

      <BookingSlideOver booking={selectedBooking} onClose={() => { setSelectedBooking(null); refetch(); }} />
      <NewBookingModal open={newBookingOpen} onOpenChange={(v) => { setNewBookingOpen(v); if (!v) refetch(); }} />
    </div>
  );
};

export default AdminCalendarPage;
