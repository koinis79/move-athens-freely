import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Truck, PackageCheck, Plus, Calendar as CalendarIcon,
  Clock, MapPin, Package,
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

const statusBarColors: Record<string, string> = {
  pending: "bg-amber-400/90 text-amber-950",
  confirmed: "bg-primary/90 text-primary-foreground",
  active: "bg-secondary/90 text-secondary-foreground",
  delivered: "bg-secondary/90 text-secondary-foreground",
  completed: "bg-accent/30 text-accent-foreground",
  cancelled: "bg-muted text-muted-foreground line-through",
};

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

// ─── Day Detail Panel ──────────────────────────────────────────
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
  const pickups = bookings.filter((b) => isPickupDay(b, date));
  const activeRentals = bookings.filter(
    (b) => bookingSpansDate(b, date) && !isDeliveryDay(b, date) && !isPickupDay(b, date) && b.status !== "cancelled"
  );

  const Section = ({ title, items, color, emptyText }: { title: string; items: AdminBooking[]; color: string; emptyText: string }) => (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <Badge variant="secondary" className="text-xs h-5 px-1.5">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground pl-4">{emptyText}</p>
      ) : (
        <div className="space-y-2 pl-4">
          {items.map((b) => (
            <button
              key={b.id}
              onClick={() => onBookingClick(b)}
              className="w-full text-left p-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="text-xs font-medium text-foreground truncate">{getEquipmentShort(b)}</div>
              <div className="text-xs text-muted-foreground">{b.customer_name}</div>
              {b.delivery_address && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{b.delivery_address}</span>
                </div>
              )}
              {b.delivery_time_slot && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="h-3 w-3" />
                  <span>{b.delivery_time_slot}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-72 xl:w-80 border-l border-border bg-card p-4 overflow-y-auto flex-shrink-0">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">{format(date, "EEEE, MMM d")}</h3>
        <p className="text-xs text-muted-foreground">{deliveries.length + pickups.length + activeRentals.length} events</p>
      </div>
      <Section title="Deliveries" items={deliveries} color="bg-secondary" emptyText="No deliveries" />
      <Section title="Pickups" items={pickups} color="bg-primary" emptyText="No pickups" />
      <Section title="Active Rentals" items={activeRentals} color="bg-emerald-500" emptyText="No active rentals" />
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === "month" && !isSameMonth(date, currentDate)) setCurrentDate(date);
  };

  // ─── Month Cell ──────────────────────────────────────────
  const MonthCell = ({ date }: { date: Date }) => {
    const isToday = isSameDay(date, today);
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const dayBookings = getBookingsForDate(date);
    const deliveries = dayBookings.filter((b) => isDeliveryDay(b, date));
    const pickups = dayBookings.filter((b) => isPickupDay(b, date));

    return (
      <button
        onClick={() => handleDateClick(date)}
        className={cn(
          "relative min-h-[100px] border-b border-r border-border p-1 text-left transition-colors hover:bg-muted/30",
          !isCurrentMonth && "bg-muted/20",
          isSelected && "ring-2 ring-inset ring-primary/40",
        )}
      >
        <div className="flex items-center justify-between mb-0.5">
          <span className={cn(
            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
            isToday && "bg-primary text-primary-foreground",
            !isToday && isCurrentMonth && "text-foreground",
            !isToday && !isCurrentMonth && "text-muted-foreground",
          )}>
            {format(date, "d")}
          </span>
          <div className="flex items-center gap-0.5">
            {deliveries.length > 0 && <span className="text-[10px]" title="Delivery">🚚</span>}
            {pickups.length > 0 && <span className="text-[10px]" title="Pickup">📥</span>}
          </div>
        </div>
        <div className="space-y-0.5 overflow-hidden">
          {dayBookings.slice(0, 3).map((b) => (
            <div
              key={b.id}
              onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
              className={cn(
                "text-[10px] leading-tight px-1 py-0.5 rounded-sm truncate cursor-pointer hover:opacity-80",
                statusBarColors[b.status] ?? statusBarColors.pending,
              )}
              title={`${getEquipmentShort(b)} — ${b.customer_name}`}
            >
              {getEquipmentShort(b)} · {getLastName(b.customer_name)}
            </div>
          ))}
          {dayBookings.length > 3 && (
            <span className="text-[10px] text-muted-foreground pl-1">+{dayBookings.length - 3} more</span>
          )}
        </div>
      </button>
    );
  };

  // ─── Week / Day Row ──────────────────────────────────────
  const WeekDayRow = ({ date }: { date: Date }) => {
    const isToday = isSameDay(date, today);
    const isSelected = isSameDay(date, selectedDate);
    const dayBookings = getBookingsForDate(date);
    const deliveries = dayBookings.filter((b) => isDeliveryDay(b, date));
    const pickups = dayBookings.filter((b) => isPickupDay(b, date));

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
            isToday && "bg-primary text-primary-foreground",
            !isToday && "text-foreground",
          )}>
            {format(date, "d")}
          </div>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {deliveries.length > 0 && <span className="text-xs">🚚</span>}
            {pickups.length > 0 && <span className="text-xs">📥</span>}
          </div>
        </div>
        <div className="flex-1 flex flex-wrap gap-1.5 min-h-[40px] items-start">
          {dayBookings.map((b) => (
            <div
              key={b.id}
              onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
              className={cn(
                "text-xs px-2 py-1 rounded-md truncate cursor-pointer hover:opacity-80 max-w-[200px]",
                statusBarColors[b.status] ?? statusBarColors.pending,
              )}
            >
              {getEquipmentShort(b)} · {getLastName(b.customer_name)}
            </div>
          ))}
          {dayBookings.length === 0 && <span className="text-xs text-muted-foreground italic">No bookings</span>}
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

        {/* Calendar body */}
        <div className="flex-1 overflow-auto bg-card rounded-b-xl">
          {viewMode === "month" && (
            <>
              <div className="grid grid-cols-7 border-b border-border">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2 border-r border-border last:border-r-0">{d}</div>
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
