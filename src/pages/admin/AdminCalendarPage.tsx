import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Truck, PackageCheck, Plus, Calendar as CalendarIcon,
  Clock, MapPin, Package,
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isWithinInterval, parseISO, addWeeks, subWeeks, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockBookings, type MockBooking, type BookingStatus } from "@/data/adminDashboardMockData";
import { bookingDetails, getFlag } from "@/data/adminBookingsMockData";
import BookingSlideOver from "@/components/admin/BookingSlideOver";
import type { BookingDetail } from "@/data/adminBookingsMockData";

type ViewMode = "month" | "week" | "day";

const statusBarColors: Record<BookingStatus, string> = {
  pending: "bg-amber-400/90 text-amber-950",
  confirmed: "bg-[hsl(217,91%,53%)]/90 text-white",
  delivered: "bg-[hsl(38,92%,50%)]/90 text-white",
  completed: "bg-[hsl(85,60%,35%)]/30 text-[hsl(85,60%,25%)]",
  cancelled: "bg-muted text-muted-foreground line-through",
};

const statusDotColors: Record<BookingStatus, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-[hsl(217,91%,53%)]",
  delivered: "bg-[hsl(38,92%,50%)]",
  completed: "bg-[hsl(85,60%,35%)]",
  cancelled: "bg-muted-foreground",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days: Date[] = [];
  let d = start;
  while (d <= end) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function bookingSpansDate(b: MockBooking, date: Date): boolean {
  const s = parseISO(b.startDate);
  const e = parseISO(b.endDate);
  return isWithinInterval(date, { start: startOfDay(s), end: endOfDay(e) });
}

function isDeliveryDay(b: MockBooking, date: Date): boolean {
  return isSameDay(parseISO(b.startDate), date) && b.status !== "cancelled";
}

function isPickupDay(b: MockBooking, date: Date): boolean {
  return isSameDay(parseISO(b.endDate), date) && b.status !== "cancelled";
}

function getLastName(name: string) {
  const parts = name.split(" ");
  return parts[parts.length - 1];
}

// ─── Day Detail Panel ──────────────────────────────────────────
function DayDetailPanel({
  date,
  bookings,
  onBookingClick,
}: {
  date: Date;
  bookings: MockBooking[];
  onBookingClick: (id: string) => void;
}) {
  const deliveries = bookings.filter((b) => isDeliveryDay(b, date));
  const pickups = bookings.filter((b) => isPickupDay(b, date));
  const activeRentals = bookings.filter(
    (b) => bookingSpansDate(b, date) && !isDeliveryDay(b, date) && !isPickupDay(b, date) && b.status !== "cancelled"
  );
  const newBookings = bookings.filter(
    (b) => b.status === "pending" && isSameDay(parseISO(b.startDate), date)
  );

  const Section = ({
    title,
    icon,
    items,
    color,
    emptyText,
  }: {
    title: string;
    icon: React.ReactNode;
    items: MockBooking[];
    color: string;
    emptyText: string;
  }) => (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <Badge variant="secondary" className="text-xs h-5 px-1.5">
          {items.length}
        </Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground pl-4">{emptyText}</p>
      ) : (
        <div className="space-y-2 pl-4">
          {items.map((b) => {
            const detail = bookingDetails.find((bd) => bd.id === b.id);
            return (
              <button
                key={b.id}
                onClick={() => onBookingClick(b.id)}
                className="w-full text-left p-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground truncate">
                    {b.equipment}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>
                    {detail ? `${getFlag(detail.countryCode)} ` : ""}
                    {b.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{b.hotel}</span>
                </div>
                {detail && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{detail.deliveryTime}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-72 xl:w-80 border-l border-border bg-card p-4 overflow-y-auto flex-shrink-0">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">
          {format(date, "EEEE, MMM d")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {deliveries.length + pickups.length + activeRentals.length} events
        </p>
      </div>

      <Section
        title="Deliveries"
        icon={<Truck className="h-3.5 w-3.5" />}
        items={deliveries}
        color="bg-[hsl(38,92%,50%)]"
        emptyText="No deliveries"
      />
      <Section
        title="Pickups"
        icon={<PackageCheck className="h-3.5 w-3.5" />}
        items={pickups}
        color="bg-[hsl(217,91%,53%)]"
        emptyText="No pickups"
      />
      <Section
        title="Active Rentals"
        icon={<Package className="h-3.5 w-3.5" />}
        items={activeRentals}
        color="bg-emerald-500"
        emptyText="No active rentals"
      />
      {newBookings.length > 0 && (
        <Section
          title="New Requests"
          icon={<Clock className="h-3.5 w-3.5" />}
          items={newBookings}
          color="bg-amber-400"
          emptyText=""
        />
      )}
    </div>
  );
}

// ─── Main Calendar Page ────────────────────────────────────────
const AdminCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);

  const navigate = (dir: -1 | 1) => {
    if (viewMode === "month") setCurrentDate((d) => (dir === 1 ? addMonths(d, 1) : subMonths(d, 1)));
    else if (viewMode === "week") setCurrentDate((d) => (dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)));
    else setCurrentDate((d) => addDays(d, dir));
  };

  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

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

  // Get bookings that appear on each day
  const getBookingsForDate = (date: Date) =>
    mockBookings.filter((b) => bookingSpansDate(b, date));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === "month" && !isSameMonth(date, currentDate)) {
      setCurrentDate(date);
    }
  };

  const handleBookingClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
  };

  const selectedBookingDetail = useMemo(
    () => (selectedBookingId ? bookingDetails.find((b) => b.id === selectedBookingId) ?? null : null),
    [selectedBookingId]
  );

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
        {/* Date number */}
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={cn(
              "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
              isToday && "bg-primary text-primary-foreground",
              !isToday && isCurrentMonth && "text-foreground",
              !isToday && !isCurrentMonth && "text-muted-foreground",
            )}
          >
            {format(date, "d")}
          </span>
          <div className="flex items-center gap-0.5">
            {deliveries.length > 0 && <span className="text-[10px]" title="Delivery">🚚</span>}
            {pickups.length > 0 && <span className="text-[10px]" title="Pickup">📥</span>}
          </div>
        </div>

        {/* Booking bars */}
        <div className="space-y-0.5 overflow-hidden">
          {dayBookings.slice(0, 3).map((b) => (
            <div
              key={b.id}
              onClick={(e) => {
                e.stopPropagation();
                handleBookingClick(b.id);
              }}
              className={cn(
                "text-[10px] leading-tight px-1 py-0.5 rounded-sm truncate cursor-pointer hover:opacity-80",
                statusBarColors[b.status],
              )}
              title={`${b.equipment} — ${b.customerName}`}
            >
              {b.equipment.split(" ").slice(0, 2).join(" ")} · {getLastName(b.customerName)}
            </div>
          ))}
          {dayBookings.length > 3 && (
            <span className="text-[10px] text-muted-foreground pl-1">
              +{dayBookings.length - 3} more
            </span>
          )}
        </div>

        {/* + button */}
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity">
          <div
            onClick={(e) => { e.stopPropagation(); }}
            className="w-4 h-4 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            title="New booking"
          >
            <Plus className="h-3 w-3" />
          </div>
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
        {/* Date column */}
        <div className="w-14 flex-shrink-0 text-center">
          <div className="text-xs text-muted-foreground">{format(date, "EEE")}</div>
          <div
            className={cn(
              "text-lg font-bold w-9 h-9 flex items-center justify-center rounded-full mx-auto",
              isToday && "bg-primary text-primary-foreground",
              !isToday && "text-foreground",
            )}
          >
            {format(date, "d")}
          </div>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {deliveries.length > 0 && <span className="text-xs">🚚</span>}
            {pickups.length > 0 && <span className="text-xs">📥</span>}
          </div>
        </div>

        {/* Bookings */}
        <div className="flex-1 flex flex-wrap gap-1.5 min-h-[40px] items-start">
          {dayBookings.map((b) => (
            <div
              key={b.id}
              onClick={(e) => {
                e.stopPropagation();
                handleBookingClick(b.id);
              }}
              className={cn(
                "text-xs px-2 py-1 rounded-md truncate cursor-pointer hover:opacity-80 max-w-[200px]",
                statusBarColors[b.status],
              )}
            >
              {b.equipment.split(" ").slice(0, 2).join(" ")} · {getLastName(b.customerName)}
            </div>
          ))}
          {dayBookings.length === 0 && (
            <span className="text-xs text-muted-foreground italic">No bookings</span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] gap-0">
      {/* Main calendar area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card rounded-t-xl">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Calendar</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex bg-muted rounded-lg p-0.5">
              {(["month", "week", "day"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                    viewMode === v
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
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
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2 border-r border-border last:border-r-0">
                    {d}
                  </div>
                ))}
              </div>
              {/* Day grid */}
              <div className="grid grid-cols-7 group">
                {days.map((date) => (
                  <MonthCell key={date.toISOString()} date={date} />
                ))}
              </div>
            </>
          )}

          {(viewMode === "week" || viewMode === "day") && (
            <div className="divide-y divide-border">
              {days.map((date) => (
                <WeekDayRow key={date.toISOString()} date={date} />
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground">
          <span className="font-medium">Status:</span>
          {(["pending", "confirmed", "delivered", "completed", "cancelled"] as BookingStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1 capitalize">
              <span className={cn("w-2.5 h-2.5 rounded-sm", statusDotColors[s])} />
              {s}
            </span>
          ))}
          <span className="ml-4">🚚 Delivery</span>
          <span>📥 Pickup</span>
        </div>
      </div>

      {/* Day detail sidebar */}
      <DayDetailPanel
        date={selectedDate}
        bookings={mockBookings}
        onBookingClick={handleBookingClick}
      />

      {/* Booking slide-over (reused) */}
      <BookingSlideOver
        booking={selectedBookingDetail}
        onClose={() => setSelectedBookingId(null)}
      />
    </div>
  );
};

export default AdminCalendarPage;
