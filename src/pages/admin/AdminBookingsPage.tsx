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
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";
import { useAdminBookings, type AdminBooking } from "@/hooks/useAdminBookings";
import BookingSlideOver from "@/components/admin/BookingSlideOver";

/* ── Status config ── */
const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmed", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  active:    { label: "Active",    cls: "bg-orange-100 text-orange-800 border-orange-200" },
  delivered: { label: "Delivered", cls: "bg-orange-100 text-orange-800 border-orange-200" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800 border-red-200" },
};

const fmtShort = (d: string) => {
  const dt = new Date(d + (d.includes("T") ? "" : "T00:00:00"));
  return format(dt, "dd MMM");
};

type SortKey = "booking_number" | "customer_name" | "rental_start" | "status" | "total_amount";
type SortDir = "asc" | "desc";

const AdminBookingsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortKey, setSortKey] = useState<SortKey>("booking_number");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailBooking, setDetailBooking] = useState<AdminBooking | null>(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  const { bookings, loading, updateBookingStatus, refetch } = useAdminBookings({
    search: search || undefined,
    status: statusFilter,
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  });

  /* Sorting */
  const sorted = useMemo(() => {
    const m = sortDir === "asc" ? 1 : -1;
    return [...bookings].sort((a, b) => {
      if (sortKey === "total_amount") return (Number(a.total_amount) - Number(b.total_amount)) * m;
      if (sortKey === "rental_start") return (a.rental_start.localeCompare(b.rental_start)) * m;
      const aVal = String(a[sortKey] ?? "");
      const bVal = String(b[sortKey] ?? "");
      return aVal.localeCompare(bVal) * m;
    });
  }, [bookings, sortKey, sortDir]);

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
          <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{bookings.length} total bookings</p>
        </div>
        <Button
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          onClick={() => setNewBookingOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" /> New Booking
        </Button>
      </div>

      {/* ── Filters ── */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-sm text-muted-foreground">
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
              className="text-muted-foreground"
              onClick={() => { setSearch(""); setStatusFilter("all"); setDateRange({}); setPage(1); }}
            >
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={paginated.length > 0 && selected.size === paginated.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                {[
                  { key: "booking_number" as SortKey, label: "Booking ID" },
                  { key: "customer_name" as SortKey, label: "Customer" },
                ].map((c) => (
                  <th
                    key={c.key}
                    className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground"
                    onClick={() => toggleSort(c.key)}
                  >
                    <span className="inline-flex items-center gap-1">{c.label} <SortIcon col={c.key} /></span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap hidden lg:table-cell">Equipment</th>
                <th
                  className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground hidden md:table-cell"
                  onClick={() => toggleSort("rental_start")}
                >
                  <span className="inline-flex items-center gap-1">Rental Period <SortIcon col="rental_start" /></span>
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort("status")}
                >
                  <span className="inline-flex items-center gap-1">Status <SortIcon col="status" /></span>
                </th>
                <th
                  className="text-right px-4 py-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort("total_amount")}
                >
                  <span className="inline-flex items-center gap-1">Amount <SortIcon col="total_amount" /></span>
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full max-w-[120px]" /></td>
                    ))}
                  </tr>
                ))
              )}
              {!loading && paginated.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No bookings match your filters.</td></tr>
              )}
              {!loading && paginated.map((b) => {
                const sc = statusConfig[b.status] ?? statusConfig.pending;
                const equipmentName = b.booking_items?.[0]?.equipment?.name_en ?? "—";
                const days = b.num_days;
                return (
                  <tr
                    key={b.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
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
                    <td className="px-4 py-3 font-mono text-xs text-primary font-semibold whitespace-nowrap">
                      {b.booking_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-foreground">{b.customer_name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                      <span className="truncate max-w-[180px] inline-block">{equipmentName}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-foreground">{fmtShort(b.rental_start)} – {fmtShort(b.rental_end)}</div>
                      <div className="text-[10px] text-muted-foreground">{days} day{days !== 1 ? "s" : ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[11px] font-semibold border", sc.cls)}>
                        {sc.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground whitespace-nowrap">
                      €{Number(b.total_amount).toFixed(0)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailBooking(b)}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "delivered")}>
                            <Truck className="h-3.5 w-3.5 mr-2" /> Mark as Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "completed")}>
                            <PackageCheck className="h-3.5 w-3.5 mr-2" /> Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => updateBookingStatus(b.id, "cancelled")}>
                            <XCircle className="h-3.5 w-3.5 mr-2" /> Cancel
                          </DropdownMenuItem>
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Rows per page
            <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[70px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
      <BookingSlideOver booking={detailBooking} onClose={() => { setDetailBooking(null); refetch(); }} />

      <NewBookingModal open={newBookingOpen} onOpenChange={(v) => { setNewBookingOpen(v); if (!v) refetch(); }} />
    </div>
  );
};

export default AdminBookingsPage;
