import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarBooking {
  id: string;
  booking_number: string;
  customer_name: string;
  rental_start: string;
  rental_end: string;
  status: string;
  booking_items: { equipment: { name_en: string } | null; quantity: number }[];
}

interface Props {
  bookings: CalendarBooking[];
  onSelectDate: (date: string) => void;
  onSelectBooking: (id: string) => void;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_SHORT = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const statusDotColor: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  preparing: "bg-purple-500",
  out_for_delivery: "bg-indigo-500",
  delivered: "bg-green-500",
  completed: "bg-gray-400",
  cancelled: "bg-red-500",
};

const statusChipColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-purple-100 text-purple-800 border-purple-200",
  out_for_delivery: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday is start
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export default function BookingsCalendar({ bookings, onSelectDate, onSelectBooking }: Props) {
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [view, setView] = useState<"month" | "week">(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? "week" : "month"
  );

  // Group bookings by rental_start ISO date
  const byDate = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {};
    for (const b of bookings) {
      const key = b.rental_start;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    }
    return map;
  }, [bookings]);

  // Build grid cells
  const cells = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    // Month view — show 6 rows × 7 days starting from the Monday of the week containing day 1
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [cursor, view]);

  const headerLabel = view === "month"
    ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
    : (() => {
        const start = startOfWeek(cursor);
        const end = addDays(start, 6);
        const sameMonth = start.getMonth() === end.getMonth();
        if (sameMonth) {
          return `${MONTHS[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
        }
        return `${MONTHS[start.getMonth()].slice(0, 3)} ${start.getDate()} – ${MONTHS[end.getMonth()].slice(0, 3)} ${end.getDate()}, ${end.getFullYear()}`;
      })();

  const gotoPrev = () => {
    if (view === "month") {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
    } else {
      setCursor(addDays(cursor, -7));
    }
  };
  const gotoNext = () => {
    if (view === "month") {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
    } else {
      setCursor(addDays(cursor, 7));
    }
  };
  const gotoToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCursor(d);
  };

  const today = toISODate(new Date());
  const currentMonth = cursor.getMonth();

  return (
    <div className="space-y-3">
      {/* Calendar header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={gotoPrev}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={gotoToday}
            className="h-8 px-3 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={gotoNext}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 className="ml-2 text-base font-semibold">{headerLabel}</h2>
        </div>

        <div className="inline-flex rounded-md border border-gray-300 p-0.5 bg-white">
          <button
            type="button"
            onClick={() => setView("week")}
            className={`px-3 py-1 text-xs font-medium rounded ${
              view === "week" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setView("month")}
            className={`px-3 py-1 text-xs font-medium rounded ${
              view === "month" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
        {[
          { label: "Pending", color: "bg-yellow-500" },
          { label: "Confirmed", color: "bg-blue-500" },
          { label: "Delivered", color: "bg-green-500" },
          { label: "Completed", color: "bg-gray-400" },
          { label: "Cancelled", color: "bg-red-500" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Day name header */}
      <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
        {DAY_NAMES.map((d, i) => (
          <div key={d + i} className="text-center px-1 py-1 hidden sm:block">
            {d}
          </div>
        ))}
        {DAY_NAMES_SHORT.map((d, i) => (
          <div key={"s" + i} className="text-center px-1 py-1 sm:hidden">
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className={`grid grid-cols-7 gap-1 ${view === "month" ? "auto-rows-[minmax(96px,1fr)]" : "auto-rows-[minmax(140px,1fr)]"}`}>
        {cells.map((d) => {
          const iso = toISODate(d);
          const inMonth = view === "week" || d.getMonth() === currentMonth;
          const isToday = iso === today;
          const dayBookings = byDate[iso] ?? [];

          return (
            <button
              type="button"
              key={iso}
              onClick={() => dayBookings.length > 0 && onSelectDate(iso)}
              className={`relative rounded-md border p-1.5 text-left transition-colors overflow-hidden ${
                inMonth ? "bg-white hover:bg-gray-50 border-gray-200" : "bg-gray-50 border-gray-100 text-gray-400"
              } ${isToday ? "ring-2 ring-blue-500 ring-offset-0" : ""} ${
                dayBookings.length > 0 ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isToday ? "text-blue-700" : ""}`}>
                  {d.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {dayBookings.length}
                  </span>
                )}
              </div>

              {/* Booking chips */}
              <div className="mt-1 space-y-0.5">
                {dayBookings.slice(0, view === "week" ? 5 : 3).map((b) => {
                  const eq = b.booking_items?.[0]?.equipment?.name_en ?? "?";
                  const extra = (b.booking_items?.length ?? 0) > 1 ? ` +${(b.booking_items?.length ?? 1) - 1}` : "";
                  return (
                    <div
                      key={b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBooking(b.id);
                      }}
                      className={`flex items-center gap-1 px-1 py-0.5 rounded border text-[10px] truncate ${
                        statusChipColor[b.status] ?? "bg-gray-100 text-gray-800 border-gray-200"
                      } hover:opacity-80`}
                      title={`${b.booking_number} · ${b.customer_name} · ${eq}${extra}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDotColor[b.status] ?? "bg-gray-400"}`} />
                      <span className="truncate">{b.customer_name}</span>
                    </div>
                  );
                })}
                {dayBookings.length > (view === "week" ? 5 : 3) && (
                  <div className="text-[10px] text-gray-500 font-medium px-1">
                    +{dayBookings.length - (view === "week" ? 5 : 3)} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
