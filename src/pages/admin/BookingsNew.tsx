import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronDown,
  MessageCircle,
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return format(d, "dd MMM yyyy");
}

export default function BookingsNew() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Marked as ${status}` });
      fetchBookings();
    }
    setOpenMenuId(null);
  }

  async function setArchived(id: string, archived: boolean) {
    const { error } = await supabase
      .from("bookings")
      .update({ is_archived: archived })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: archived ? "Booking archived" : "Booking restored" });
      fetchBookings();
    }
    setOpenMenuId(null);
  }

  const filtered = bookings.filter((b) => {
    if (tab === "active" && b.is_archived) return false;
    if (tab === "archived" && !b.is_archived) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
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
      </div>

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
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelected(b)}
                >
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
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[b.status] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {b.status.replace(/_/g, " ")}
                    </span>
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
                      Actions <ChevronDown className="h-3 w-3" />
                    </button>
                    {openMenuId === b.id && (
                      <div
                        className="absolute right-4 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tab === "active" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateStatus(b.id, "confirmed")}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Check className="h-3.5 w-3.5" /> Mark Confirmed
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(b.id, "delivered")}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Truck className="h-3.5 w-3.5" /> Mark Delivered
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(b.id, "completed")}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Check className="h-3.5 w-3.5" /> Mark Completed
                            </button>
                            {(b.status === "completed" || b.status === "cancelled") && (
                              <>
                                <div className="h-px bg-gray-200 my-1" />
                                <button
                                  type="button"
                                  onClick={() => setArchived(b.id, true)}
                                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Archive className="h-3.5 w-3.5" /> Archive
                                </button>
                              </>
                            )}
                            <div className="h-px bg-gray-200 my-1" />
                            <button
                              type="button"
                              onClick={() => updateStatus(b.id, "cancelled")}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                            >
                              <XIcon className="h-3.5 w-3.5" /> Cancel Booking
                            </button>
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
              ))}
          </tbody>
        </table>
      </div>

      {/* Side panel / modal */}
      {selected && (
        <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setSelected(null)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
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
                <p className="text-gray-700">
                  {selected.delivery_zones?.name_en ?? "—"}
                </p>
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
                  Status
                </h3>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[selected.status] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selected.status.replace(/_/g, " ")}
                </span>
                {selected.is_archived && (
                  <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                    archived
                  </span>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
