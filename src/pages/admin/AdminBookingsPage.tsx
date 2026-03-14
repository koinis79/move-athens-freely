import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search, SlidersHorizontal, Plus, MoreHorizontal, Eye, Pencil,
  Truck, PackageCheck, XCircle, Phone, ChevronUp, ChevronDown,
} from "lucide-react";
import NewBookingModal from "@/components/admin/NewBookingModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  bookingDetails, getFlag, type BookingDetail,
} from "@/data/adminBookingsMockData";
import type { BookingStatus } from "@/data/adminDashboardMockData";
import BookingSlideOver from "@/components/admin/BookingSlideOver";

/* ── Status config ── */
const statusConfig: Record<BookingStatus, { label: string; cls: string }> = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmed", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  delivered: { label: "Delivered", cls: "bg-orange-100 text-orange-800 border-orange-200" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800 border-red-200" },
};

const fmtShort = (d: string) => {
  const dt = new Date(d + (d.includes("T") ? "" : "T00:00:00"));
  return format(dt, "dd MMM");
};

const daysBetween = (a: string, b: string) => {
  const msA = new Date(a + "T00:00:00").getTime();
  const msB = new Date(b + "T00:00:00").getTime();
  return Math.round((msB - msA) / 86400000);
};

type SortKey = "bookingId" | "customerName" | "startDate" | "status" | "amount";
type SortDir = "asc" | "desc";

const AdminBookingsPage = () => {
  /* State */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortKey, setSortKey] = useState<SortKey>("bookingId");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailBooking, setDetailBooking] = useState<BookingDetail | null>(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  /* Filtering */
  const filtered = useMemo(() => {
    let list = [...bookingDetails];
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.bookingId.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.equipment.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((b) => b.status === statusFilter);
    }
    if (dateRange.from) {
      const from = dateRange.from.getTime();
      list = list.filter((b) => new Date(b.startDate).getTime() >= from);
    }
    if (dateRange.to) {
      const to = dateRange.to.getTime() + 86400000;
      list = list.filter((b) => new Date(b.startDate).getTime() < to);
    }
    return list;
  }, [search, statusFilter, dateRange]);

  /* Sorting */
  const sorted = useMemo(() => {
    const m = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "amount") return (a.amount - b.amount) * m;
      if (sortKey === "startDate") return (a.startDate.localeCompare(b.startDate)) * m;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * m;
    });
  }, [filtered, sortKey, sortDir]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-25" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3" />;
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((b) => b.id)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Bookings</h1>
          <p className="text-sm text-[#718096] mt-0.5">{filtered.length} total bookings</p>
        </div>
        <Button
          className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white"
          onClick={() => setNewBookingOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" /> New Booking
        </Button>
      </div>

      {/* ── Filters ── */}
      <Card className="border border-[#E2E4E9] shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
            <Input
              placeholder="Search bookings…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 border-[#E2E4E9]"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] border-[#E2E4E9]">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-[#718096]" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-[#E2E4E9] text-sm text-[#4A5568]">
                {dateRange.from
                  ? `${format(dateRange.from, "dd MMM")}${dateRange.to ? ` – ${format(dateRange.to, "dd MMM")}` : ""}`
                  : "Date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                onSelect={(r) => { setDateRange({ from: r?.from, to: r?.to }); setPage(1); }}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {(search || statusFilter !== "all" || dateRange.from) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#718096]"
              onClick={() => { setSearch(""); setStatusFilter("all"); setDateRange({}); setPage(1); }}
            >
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card className="border border-[#E2E4E9] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E4E9] bg-[#F9FAFB]">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={paginated.length > 0 && selected.size === paginated.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                {[
                  { key: "bookingId" as SortKey, label: "Booking ID" },
                  { key: "customerName" as SortKey, label: "Customer" },
                ].map((c) => (
                  <th
                    key={c.key}
                    className="text-left px-4 py-3 font-medium text-[#718096] whitespace-nowrap cursor-pointer select-none hover:text-[#1A202C]"
                    onClick={() => toggleSort(c.key)}
                  >
                    <span className="inline-flex items-center gap-1">{c.label} <SortIcon col={c.key} /></span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium text-[#718096] whitespace-nowrap hidden lg:table-cell">Equipment</th>
                <th
                  className="text-left px-4 py-3 font-medium text-[#718096] whitespace-nowrap cursor-pointer select-none hover:text-[#1A202C] hidden md:table-cell"
                  onClick={() => toggleSort("startDate")}
                >
                  <span className="inline-flex items-center gap-1">Rental Period <SortIcon col="startDate" /></span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#718096] whitespace-nowrap hidden xl:table-cell">Delivery</th>
                <th
                  className="text-left px-4 py-3 font-medium text-[#718096] whitespace-nowrap cursor-pointer select-none hover:text-[#1A202C]"
                  onClick={() => toggleSort("status")}
                >
                  <span className="inline-flex items-center gap-1">Status <SortIcon col="status" /></span>
                </th>
                <th
                  className="text-right px-4 py-3 font-medium text-[#718096] whitespace-nowrap cursor-pointer select-none hover:text-[#1A202C]"
                  onClick={() => toggleSort("amount")}
                >
                  <span className="inline-flex items-center gap-1">Amount <SortIcon col="amount" /></span>
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-[#A0AEC0]">No bookings match your filters.</td></tr>
              )}
              {paginated.map((b) => {
                const sc = statusConfig[b.status];
                const days = daysBetween(b.startDate, b.endDate);
                return (
                  <tr
                    key={b.id}
                    className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                    onClick={() => setDetailBooking(b)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(b.id)}
                        onCheckedChange={(v) => {
                          const s = new Set(selected);
                          v ? s.add(b.id) : s.delete(b.id);
                          setSelected(s);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#1B4965] font-semibold whitespace-nowrap">
                      {b.bookingId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-[#1A202C]">{getFlag(b.countryCode)} {b.customerName}</span>
                    </td>
                    <td className="px-4 py-3 text-[#4A5568] whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-[#F4F5F7] flex items-center justify-center text-[10px] text-[#A0AEC0] shrink-0">IMG</div>
                        <span className="truncate max-w-[180px]">{b.equipment}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-[#1A202C]">{fmtShort(b.startDate)} – {fmtShort(b.endDate)}</div>
                      <div className="text-[10px] text-[#A0AEC0]">{days} day{days !== 1 ? "s" : ""}</div>
                    </td>
                    <td className="px-4 py-3 text-[#718096] whitespace-nowrap hidden xl:table-cell">
                      <div className="truncate max-w-[160px]">{b.hotel}</div>
                      <div className="text-[10px] text-[#A0AEC0]">{b.deliveryArea}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[11px] font-semibold border", sc.cls)}>
                        {sc.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#1A202C] whitespace-nowrap">
                      €{b.amount}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-[#718096]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailBooking(b)}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem><Truck className="h-3.5 w-3.5 mr-2" /> Mark as Delivered</DropdownMenuItem>
                          <DropdownMenuItem><PackageCheck className="h-3.5 w-3.5 mr-2" /> Mark as Picked Up</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem><Phone className="h-3.5 w-3.5 mr-2" /> Contact Customer</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><XCircle className="h-3.5 w-3.5 mr-2" /> Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E4E9] bg-[#F9FAFB]">
          <div className="flex items-center gap-2 text-sm text-[#718096]">
            Rows per page
            <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[70px] h-8 border-[#E2E4E9] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#718096]">
            Page {page} of {totalPages}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronUp className="h-4 w-4 -rotate-90" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Detail Slide-over ── */}
      <BookingSlideOver booking={detailBooking} onClose={() => setDetailBooking(null)} />

      <NewBookingModal open={newBookingOpen} onOpenChange={setNewBookingOpen} />
    </div>
  );
};

export default AdminBookingsPage;
