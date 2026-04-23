import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import BookingsCalendar from "./BookingsCalendar";
import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  History,
  List,
  MessageCircle,
  Printer,
  Search,
  Truck,
  X as XIcon,
} from "lucide-react";

interface BookingItem {
  quantity: number;
  num_days: number;
  subtotal: number;
  equipment: { name_en: string } | null;
}

interface StatusHistoryEntry {
  id: string;
  status: string;
  changed_at: string;
  changed_by_email: string | null;
}

interface Booking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  delivery_notes: string | null;
  rental_start: string;
  rental_end: string;
  total_amount: number;
  payment_status: string;
  status: string;
  internal_notes: string | null;
  is_archived: boolean;
  created_at: string;
  delivery_zones: { name_en: string } | null;
  booking_items: BookingItem[];
}

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

/** Next status in the quick-advance flow. Returns null if no advance is possible. */
function nextStatus(current: string): string | null {
  const flow: Record<string, string> = {
    pending: "confirmed",
    confirmed: "delivered",
    preparing: "out_for_delivery",
    out_for_delivery: "delivered",
    delivered: "completed",
  };
  return flow[current] ?? null;
}

function nextStatusLabel(current: string): string | null {
  const next = nextStatus(current);
  if (!next) return null;
  return next.replace(/_/g, " ");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return format(d, "dd MMM yyyy");
}

export default function BookingsNew() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [layoutMode, setLayoutMode] = useState<"list" | "calendar">("list");
  const [calendarDateFilter, setCalendarDateFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkArchiveConfirm, setBulkArchiveConfirm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<Booking | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<Booking | null>(null);

  async function fetchBookings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, booking_number, customer_name, customer_email, customer_phone,
        delivery_address, delivery_notes, rental_start, rental_end,
        total_amount, payment_status, status, internal_notes, is_archived, created_at,
        delivery_zones ( name_en ),
        booking_items ( quantity, num_days, subtotal, equipment ( name_en ) )
      `)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Error loading bookings", description: error.message, variant: "destructive" });
      return;
    }
    setBookings((data as unknown as Booking[]) ?? []);
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  // Clear selection when tab or filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [tab, statusFilter, search, calendarDateFilter, layoutMode]);

  // Fetch status history when a booking is selected
  useEffect(() => {
    if (!selected) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    async function loadHistory() {
      if (!selected) return;
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from("booking_status_history")
        .select("id, status, changed_at, changed_by_email")
        .eq("booking_id", selected.id)
        .order("changed_at", { ascending: true });
      if (cancelled) return;
      setLoadingHistory(false);
      if (error) {
        console.error("Failed to load status history:", error);
        setHistory([]);
        return;
      }
      setHistory((data as StatusHistoryEntry[]) ?? []);
    }
    loadHistory();
    return () => { cancelled = true; };
  }, [selected?.id, selected?.status]);


  async function updateStatus(id: string, status: string, successMsg?: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: successMsg ?? `Status: ${status.replace(/_/g, " ")}` });
    await fetchBookings();
    // Update selected booking if it's the same one
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    setOpenMenuId(null);
  }

  async function setArchived(id: string, archived: boolean) {
    const { error } = await supabase
      .from("bookings")
      .update({ is_archived: archived })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: archived ? "Booking archived" : "Booking restored" });
    await fetchBookings();
    setSelected(null);
    setOpenMenuId(null);
    setArchiveConfirm(null);
  }

  async function cancelBooking(id: string) {
    await updateStatus(id, "cancelled", "Booking cancelled");
    setCancelConfirm(null);
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: "cancelled" } : prev));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkSetArchived(archived: boolean) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("bookings")
      .update({ is_archived: archived })
      .in("id", ids);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: archived ? `${ids.length} booking${ids.length !== 1 ? "s" : ""} archived` : `${ids.length} booking${ids.length !== 1 ? "s" : ""} restored`,
    });
    setSelectedIds(new Set());
    setBulkArchiveConfirm(false);
    await fetchBookings();
  }

  function exportCSV() {
    const ids = selectedIds;
    const rows = bookings.filter((b) => ids.has(b.id));
    if (rows.length === 0) return;

    const headers = [
      "booking_number", "customer_name", "customer_email", "customer_phone",
      "equipment", "rental_start", "rental_end", "status", "total_amount",
    ];

    const esc = (v: unknown) => {
      const s = String(v ?? "");
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = rows.map((b) => {
      const equipment = b.booking_items
        .map((i) => `${i.equipment?.name_en ?? "?"} x${i.quantity}`)
        .join("; ");
      return [
        b.booking_number,
        b.customer_name,
        b.customer_email,
        b.customer_phone ?? "",
        equipment,
        b.rental_start,
        b.rental_end,
        b.status,
        Number(b.total_amount).toFixed(2),
      ].map(esc).join(",");
    });

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `bookings-export-${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${rows.length} booking${rows.length !== 1 ? "s" : ""} as CSV` });
  }

  function printPackingSlip(b: Booking) {
    const logoUrl = "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/movability-logo.png";
    const itemsHtml = b.booking_items
      .map((i) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #000;font-size:14px;">
            ${(i.equipment?.name_en ?? "Equipment").replace(/</g, "&lt;")}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #000;font-size:14px;text-align:center;width:80px;">
            ${i.quantity}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #000;font-size:14px;text-align:center;width:80px;">
            ${i.num_days}
          </td>
        </tr>`)
      .join("");

    const notesBlock = b.delivery_notes
      ? `<div style="margin:18px 0;padding:12px 14px;border:2px solid #000;background:#fff;">
           <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Special Instructions</p>
           <p style="margin:6px 0 0;font-size:14px;line-height:1.5;">${String(b.delivery_notes).replace(/</g, "&lt;")}</p>
         </div>`
      : "";

    const phoneBlock = b.customer_phone
      ? `<p style="margin:4px 0 0;font-size:14px;">☎ ${String(b.customer_phone).replace(/</g, "&lt;")}</p>`
      : "";

    const deliveryZone = b.delivery_zones?.name_en ?? "—";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Packing Slip — ${b.booking_number}</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #000; background: #fff; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 14px; margin-bottom: 18px; }
    .header img { height: 48px; width: auto; filter: grayscale(100%); }
    .header .title { text-align: right; }
    .header .title h1 { margin: 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .header .title p { margin: 2px 0 0; font-size: 11px; color: #333; }
    .booking-number { text-align: center; margin: 20px 0 24px; }
    .booking-number p { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #333; }
    .booking-number h2 { margin: 4px 0 0; font-size: 32px; font-weight: 800; font-family: "Courier New", monospace; letter-spacing: 4px; }
    .section { margin-bottom: 18px; }
    .section h3 { margin: 0 0 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #333; border-bottom: 1px solid #000; padding-bottom: 4px; }
    .section p { margin: 4px 0; font-size: 14px; line-height: 1.5; }
    .two-col { display: flex; gap: 24px; }
    .two-col > div { flex: 1; }
    .big-address { font-size: 18px; font-weight: 600; line-height: 1.4; }
    table { width: 100%; border-collapse: collapse; border: 2px solid #000; }
    table th { background: #000; color: #fff; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
    table th.center { text-align: center; }
    .signature { margin-top: 40px; display: flex; gap: 40px; }
    .signature > div { flex: 1; }
    .signature .line { border-bottom: 1px solid #000; margin-top: 40px; }
    .signature .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #333; margin-top: 6px; }
    .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #555; border-top: 1px solid #000; padding-top: 10px; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="Movability" onerror="this.style.display='none'" />
    <div class="title">
      <h1>Packing Slip</h1>
      <p>Movability · Koinis Healthcare Group</p>
      <p>Stadiou 31, Athens · +30 697 463 3697</p>
    </div>
  </div>

  <div class="booking-number">
    <p>Booking Reference</p>
    <h2>${b.booking_number}</h2>
  </div>

  <div class="two-col">
    <div class="section">
      <h3>Customer</h3>
      <p style="font-size:18px;font-weight:700;margin-top:6px;">${b.customer_name.replace(/</g, "&lt;")}</p>
      ${phoneBlock}
      <p style="font-size:12px;color:#555;">${b.customer_email.replace(/</g, "&lt;")}</p>
    </div>
    <div class="section">
      <h3>Rental Period</h3>
      <p style="font-size:16px;font-weight:600;margin-top:6px;">
        ${formatDate(b.rental_start)}
      </p>
      <p style="font-size:16px;font-weight:600;">
        → ${formatDate(b.rental_end)}
      </p>
    </div>
  </div>

  <div class="section">
    <h3>Delivery Address</h3>
    <p class="big-address">${(b.delivery_address ?? "Store pickup").replace(/</g, "&lt;")}</p>
    <p style="font-size:13px;color:#555;margin-top:4px;">Zone: ${deliveryZone.replace(/</g, "&lt;")}</p>
  </div>

  <div class="section">
    <h3>Equipment</h3>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="center">Qty</th>
          <th class="center">Days</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  </div>

  ${notesBlock}

  <div class="signature">
    <div>
      <div class="line"></div>
      <p class="label">Delivered by (Signature)</p>
    </div>
    <div>
      <div class="line"></div>
      <p class="label">Received by (Signature)</p>
    </div>
    <div>
      <div class="line"></div>
      <p class="label">Date / Time</p>
    </div>
  </div>

  <div class="footer">
    Movability by Koinis Healthcare Group · Athens, Greece · info@movability.gr
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) {
      toast({
        title: "Pop-up blocked",
        description: "Please allow pop-ups to print the packing slip.",
        variant: "destructive",
      });
      return;
    }
    w.document.write(html);
    w.document.close();
  }

  const filtered = bookings.filter((b) => {
    if (tab === "active" && b.is_archived) return false;
    if (tab === "archived" && !b.is_archived) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (calendarDateFilter && b.rental_start !== calendarDateFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.booking_number.toLowerCase().includes(q) ||
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = bookings.filter((b) => !b.is_archived).length;
  const archivedCount = bookings.filter((b) => b.is_archived).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings (New)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Experimental clean admin view — {bookings.length} total bookings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "active"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Active <span className="ml-1 text-xs text-gray-400">({activeCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("archived")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "archived"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Archived <span className="ml-1 text-xs text-gray-400">({archivedCount})</span>
        </button>

        {/* List / Calendar view toggle */}
        <div className="ml-auto inline-flex rounded-md border border-gray-300 p-0.5 bg-white self-center">
          <button
            type="button"
            onClick={() => { setLayoutMode("list"); setCalendarDateFilter(null); }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
              layoutMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("calendar")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
              layoutMode === "calendar" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" /> Calendar
          </button>
        </div>
      </div>

      {/* Active date filter chip */}
      {calendarDateFilter && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-sm text-blue-800 self-start">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Showing {new Date(calendarDateFilter + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          <button
            type="button"
            onClick={() => setCalendarDateFilter(null)}
            className="ml-1 text-blue-700 hover:text-blue-900"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {layoutMode === "calendar" ? (
        <BookingsCalendar
          bookings={bookings.filter((b) => tab === "active" ? !b.is_archived : b.is_archived)}
          onSelectDate={(date) => {
            setCalendarDateFilter(date);
            setLayoutMode("list");
          }}
          onSelectBooking={(id) => {
            const b = bookings.find((x) => x.id === id);
            if (b) setSelected(b);
          }}
        />
      ) : (
      <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by booking #, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-[180px]"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600">
            <tr>
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id))}
                  ref={(el) => {
                    if (el) {
                      const anySel = filtered.some((b) => selectedIds.has(b.id));
                      const allSel = filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id));
                      el.indeterminate = anySel && !allSel;
                    }
                  }}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(filtered.map((b) => b.id)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 text-left">Booking #</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Equipment</th>
              <th className="px-4 py-3 text-left">Dates</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((b) => {
                const nxt = nextStatus(b.status);
                const nxtLabel = nextStatusLabel(b.status);
                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedIds.has(b.id) ? "bg-blue-50" : ""}`}
                    onClick={() => setSelected(b)}
                  >
                    <td className="px-3 py-3 w-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.has(b.id)}
                        onChange={() => toggleSelect(b.id)}
                        aria-label={`Select ${b.booking_number}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{b.booking_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{b.customer_name}</div>
                      <div className="text-xs text-gray-500">{b.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {b.booking_items
                        .map((i) => `${i.equipment?.name_en ?? "?"} ×${i.quantity}`)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {formatDate(b.rental_start)} → {formatDate(b.rental_end)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[b.status] ?? "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {b.status.replace(/_/g, " ")}
                        </span>
                        {tab === "active" && nxt && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(b.id, nxt);
                            }}
                            title={`Advance to ${nxtLabel}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            <ArrowRight className="h-3 w-3" /> {nxtLabel}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      €{Number(b.total_amount).toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === b.id ? null : b.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100"
                      >
                        More <ChevronDown className="h-3 w-3" />
                      </button>
                      {openMenuId === b.id && (
                        <div
                          className="absolute right-4 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {tab === "active" ? (
                            <>
                              {STATUSES.filter((s) => s !== b.status && s !== "cancelled").map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => updateStatus(b.id, s)}
                                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 capitalize"
                                >
                                  {s.replace(/_/g, " ")}
                                </button>
                              ))}
                              {(b.status === "completed" || b.status === "cancelled") && (
                                <>
                                  <div className="h-px bg-gray-200 my-1" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setArchiveConfirm(b);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <Archive className="h-3.5 w-3.5" /> Archive
                                  </button>
                                </>
                              )}
                              {b.status !== "cancelled" && (
                                <>
                                  <div className="h-px bg-gray-200 my-1" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCancelConfirm(b);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                  >
                                    <XIcon className="h-3.5 w-3.5" /> Cancel Booking
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setArchived(b.id, false)}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                              <ArchiveRestore className="h-3.5 w-3.5" /> Restore
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      </>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-3xl w-[calc(100%-2rem)] rounded-xl bg-gray-900 text-white shadow-2xl border border-gray-800 flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            {tab === "active" ? (
              <button
                type="button"
                onClick={() => setBulkArchiveConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Archive className="h-3.5 w-3.5" /> Archive All
              </button>
            ) : (
              <button
                type="button"
                onClick={() => bulkSetArchived(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArchiveRestore className="h-3.5 w-3.5" /> Unarchive All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bulk archive confirmation modal */}
      {bulkArchiveConfirm && (
        <div
          className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setBulkArchiveConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Archive {selectedIds.size} booking{selectedIds.size !== 1 ? "s" : ""}?</h3>
            <p className="text-sm text-gray-600 mt-2">
              The selected bookings will be moved to the Archived tab. You can restore them later.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setBulkArchiveConfirm(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => bulkSetArchived(true)}
                className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
              >
                Archive All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side panel */}
      {selected && (
        <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setSelected(null)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <p className="text-xs text-gray-500">Booking</p>
                <p className="font-mono font-semibold">{selected.booking_number}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              {/* Print packing slip */}
              <button
                type="button"
                onClick={() => printPackingSlip(selected)}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                <Printer className="h-4 w-4" /> Print Packing Slip
              </button>

              {/* Prominent action buttons */}
              {!selected.is_archived && (
                <div className="space-y-2">
                  {/* Primary action button — contextual based on status */}
                  {(selected.status === "pending" || selected.status === "confirmed") && (
                    <button
                      type="button"
                      onClick={() => updateStatus(selected.id, "delivered", "Marked as delivered")}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      <Truck className="h-4 w-4" /> Mark Delivered
                    </button>
                  )}

                  {selected.status === "delivered" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(selected.id, "completed", "Marked as completed")}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Mark Completed
                    </button>
                  )}

                  {/* Pending → Confirmed shortcut */}
                  {selected.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(selected.id, "confirmed", "Booking confirmed")}
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-700 border border-blue-200 font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      <Check className="h-4 w-4" /> Just Confirm (no delivery yet)
                    </button>
                  )}

                  {/* Archive button for completed/cancelled */}
                  {(selected.status === "completed" || selected.status === "cancelled") && (
                    <button
                      type="button"
                      onClick={() => setArchiveConfirm(selected)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      <Archive className="h-4 w-4" /> Archive Booking
                    </button>
                  )}

                  {/* Cancel button */}
                  {selected.status !== "cancelled" && selected.status !== "completed" && (
                    <button
                      type="button"
                      onClick={() => setCancelConfirm(selected)}
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      <XIcon className="h-4 w-4" /> Cancel Booking
                    </button>
                  )}
                </div>
              )}

              {selected.is_archived && (
                <button
                  type="button"
                  onClick={() => setArchived(selected.id, false)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  <ArchiveRestore className="h-4 w-4" /> Restore Booking
                </button>
              )}

              <section>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  Customer
                </h3>
                <p className="font-medium">{selected.customer_name}</p>
                <p className="text-gray-600">
                  <a href={`mailto:${selected.customer_email}`} className="hover:underline text-blue-600">
                    {selected.customer_email}
                  </a>
                </p>
                {selected.customer_phone && (
                  <p className="text-gray-600 flex items-center gap-1 mt-0.5">
                    {selected.customer_phone}
                    <a
                      href={`https://wa.me/${selected.customer_phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-green-600"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5 inline" />
                    </a>
                  </p>
                )}
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  Equipment
                </h3>
                <ul className="space-y-1">
                  {selected.booking_items.map((i, idx) => (
                    <li key={idx} className="text-gray-700">
                      {i.equipment?.name_en ?? "Equipment"} × {i.quantity} · {i.num_days}d · €{Number(i.subtotal).toFixed(0)}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  Rental Period
                </h3>
                <p>{formatDate(selected.rental_start)} → {formatDate(selected.rental_end)}</p>
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  Delivery
                </h3>
                <p className="text-gray-700">{selected.delivery_zones?.name_en ?? "—"}</p>
                <p className="text-gray-600 text-xs mt-1">{selected.delivery_address ?? "—"}</p>
                {selected.delivery_notes && (
                  <p className="text-amber-700 text-xs mt-2 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                    Notes: {selected.delivery_notes}
                  </p>
                )}
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  Payment
                </h3>
                <p className="text-lg font-bold text-blue-600">
                  €{Number(selected.total_amount).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Status: {selected.payment_status}</p>
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  Current Status
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[selected.status] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selected.status.replace(/_/g, " ")}
                  </span>
                  {selected.is_archived && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                      archived
                    </span>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Timeline
                </h3>
                {loadingHistory ? (
                  <p className="text-xs text-gray-400">Loading...</p>
                ) : (
                  <ol className="relative border-l-2 border-gray-200 ml-2 space-y-4 py-1">
                    {/* Creation entry — always shown from booking.created_at */}
                    <li className="ml-4 relative">
                      <span className="absolute -left-[22px] top-0.5 h-3 w-3 rounded-full bg-gray-400 border-2 border-white" />
                      <p className="text-xs font-semibold text-gray-700 capitalize">Created</p>
                      <p className="text-[11px] text-gray-500">
                        {new Date(selected.created_at).toLocaleString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </li>

                    {history.map((h) => {
                      const dotColor = statusColors[h.status]?.replace("text-", "bg-").split(" ")[0] ?? "bg-gray-400";
                      return (
                        <li key={h.id} className="ml-4 relative">
                          <span className={`absolute -left-[22px] top-0.5 h-3 w-3 rounded-full border-2 border-white ${
                            h.status === "pending" ? "bg-yellow-500" :
                            h.status === "confirmed" ? "bg-blue-500" :
                            h.status === "preparing" ? "bg-purple-500" :
                            h.status === "out_for_delivery" ? "bg-indigo-500" :
                            h.status === "delivered" ? "bg-green-500" :
                            h.status === "completed" ? "bg-gray-600" :
                            h.status === "cancelled" ? "bg-red-500" :
                            "bg-gray-400"
                          }`} />
                          <p className="text-xs font-semibold text-gray-700 capitalize">{h.status.replace(/_/g, " ")}</p>
                          <p className="text-[11px] text-gray-500">
                            {new Date(h.changed_at).toLocaleString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                            {h.changed_by_email && <span className="text-gray-400"> · by {h.changed_by_email}</span>}
                          </p>
                        </li>
                      );
                    })}

                    {history.length === 0 && !loadingHistory && (
                      <li className="ml-4 text-xs text-gray-400 italic">No status changes yet</li>
                    )}
                  </ol>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirmation modal */}
      {archiveConfirm && (
        <div
          className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setArchiveConfirm(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Archive this booking?</h3>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-mono">{archiveConfirm.booking_number}</span> will be moved to the Archived tab. You can restore it later.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setArchiveConfirm(null)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setArchived(archiveConfirm.id, true)}
                className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelConfirm && (
        <div
          className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setCancelConfirm(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Cancel this booking?</h3>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-mono">{cancelConfirm.booking_number}</span> will be marked as cancelled. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setCancelConfirm(null)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={() => cancelBooking(cancelConfirm.id)}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
