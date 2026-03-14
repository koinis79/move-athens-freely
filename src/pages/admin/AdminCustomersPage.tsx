import { useState, useMemo } from "react";
import {
  Search, Download, ChevronUp, ChevronDown, Phone, Mail,
  Users, ArrowUpDown, MessageSquare, Plus, Send, ExternalLink,
  Globe, Calendar as CalendarIcon, CreditCard, Clock,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  customers, getCustomerBookings, getCustomerStats, getFlag,
  type Customer, type CustomerNote,
} from "@/data/adminCustomersMockData";
import type { BookingStatus } from "@/data/adminDashboardMockData";

// ─── Status badge config ──────────────────────────────────────
const statusCls: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-orange-100 text-orange-800 border-orange-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

type SortKey = "name" | "totalBookings" | "lastBooking" | "totalSpent";
type FilterKey = "all" | "active" | "repeat" | "recent";

// ─── Customer Slide-over ──────────────────────────────────────
function CustomerSlideOver({
  customer,
  onClose,
}: {
  customer: Customer | null;
  onClose: () => void;
}) {
  const [newNote, setNewNote] = useState("");
  const [tab, setTab] = useState("history");

  if (!customer) return null;

  const stats = getCustomerStats(customer.id);
  const bookings = getCustomerBookings(customer.id);

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-5 pb-0">
          <SheetTitle className="text-lg">{customer.name}</SheetTitle>
        </SheetHeader>

        {/* Header card */}
        <div className="p-5 pt-3">
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">{getFlag(customer.countryCode)}</span>
              <span className="text-foreground font-medium">{customer.nationality}</span>
              <span className="text-muted-foreground">· {customer.language}</span>
            </div>
            <div className="space-y-1.5">
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Mail className="h-3.5 w-3.5" /> {customer.email}
              </a>
              <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Phone className="h-3.5 w-3.5" /> {customer.phone}
              </a>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{stats.totalBookings}</p>
                <p className="text-[11px] text-muted-foreground">Bookings</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">€{stats.totalSpent}</p>
                <p className="text-[11px] text-muted-foreground">Total Spent</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground mt-1">
                  {format(new Date(customer.memberSince), "MMM yyyy")}
                </p>
                <p className="text-[11px] text-muted-foreground">Member Since</p>
              </div>
            </div>
            {stats.hasActiveRental && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                Active Rental
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="px-5">
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="history" className="text-xs">Bookings</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            <TabsTrigger value="comms" className="text-xs">Messages</TabsTrigger>
          </TabsList>

          {/* Booking History */}
          <TabsContent value="history" className="mt-3 space-y-2 pb-6">
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No bookings found.</p>
            ) : (
              bookings
                .sort((a, b) => b.startDate.localeCompare(a.startDate))
                .map((b) => (
                  <div
                    key={b.id}
                    className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono text-muted-foreground">{b.bookingId}</span>
                      <Badge variant="outline" className={cn("text-[10px] h-5", statusCls[b.status])}>
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{b.equipment}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(b.startDate), "dd MMM")} – {format(new Date(b.endDate), "dd MMM yyyy")}
                      </span>
                      <span className="text-sm font-semibold text-foreground">€{b.amount}</span>
                    </div>
                  </div>
                ))
            )}
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="mt-3 space-y-3 pb-6">
            <div className="space-y-2">
              <Textarea
                placeholder="Add internal note about this customer…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="text-sm min-h-[70px]"
              />
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                disabled={!newNote.trim()}
              >
                <Send className="h-3 w-3 mr-1" /> Save Note
              </Button>
            </div>

            {customer.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No notes yet.</p>
            ) : (
              customer.notes
                .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                .map((n) => (
                  <div key={n.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{n.author}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(n.timestamp), "dd MMM yyyy, HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.text}</p>
                  </div>
                ))
            )}
          </TabsContent>

          {/* Communications (placeholder) */}
          <TabsContent value="comms" className="mt-3 pb-6">
            <div className="text-center py-8 space-y-3">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">Email & SMS history will appear here.</p>
              <Button variant="outline" size="sm" disabled className="text-xs">
                <Send className="h-3 w-3 mr-1" /> Send Message — Coming Soon
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const AdminCustomersPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Enrich customers with computed stats
  const enriched = useMemo(
    () =>
      customers.map((c) => ({
        ...c,
        stats: getCustomerStats(c.id),
      })),
    []
  );

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  }, []);

  const filtered = useMemo(() => {
    let list = enriched;

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    // Filter
    if (filter === "active") list = list.filter((c) => c.stats.hasActiveRental);
    if (filter === "repeat") list = list.filter((c) => c.stats.totalBookings >= 2);
    if (filter === "recent")
      list = list.filter((c) => c.stats.lastBooking && c.stats.lastBooking >= thirtyDaysAgo);

    // Sort
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "totalBookings":
          cmp = a.stats.totalBookings - b.stats.totalBookings;
          break;
        case "totalSpent":
          cmp = a.stats.totalSpent - b.stats.totalSpent;
          break;
        case "lastBooking":
          cmp = (a.stats.lastBooking ?? "").localeCompare(b.stats.lastBooking ?? "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [enriched, search, filter, sortBy, sortDir, thirtyDaysAgo]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Customers</h1>
          <Badge variant="secondary" className="text-xs ml-1">
            {filtered.length}
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Select value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="active">Active Rental</SelectItem>
            <SelectItem value="repeat">Repeat (2+)</SelectItem>
            <SelectItem value="recent">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortKey); setSortDir("asc"); }}>
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="totalBookings">Total Bookings</SelectItem>
            <SelectItem value="lastBooking">Last Booking</SelectItem>
            <SelectItem value="totalSpent">Total Spent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3">
                  <button onClick={() => toggleSort("name")} className="flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground">
                    Customer <SortIcon col="name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Nationality</th>
                <th className="text-center px-4 py-3">
                  <button onClick={() => toggleSort("totalBookings")} className="flex items-center justify-center text-xs font-semibold text-muted-foreground hover:text-foreground mx-auto">
                    Bookings <SortIcon col="totalBookings" />
                  </button>
                </th>
                <th className="text-right px-4 py-3">
                  <button onClick={() => toggleSort("totalSpent")} className="flex items-center justify-end text-xs font-semibold text-muted-foreground hover:text-foreground ml-auto">
                    Spent <SortIcon col="totalSpent" />
                  </button>
                </th>
                <th className="text-left px-4 py-3">
                  <button onClick={() => toggleSort("lastBooking")} className="flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground">
                    Last Booking <SortIcon col="lastBooking" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground lg:hidden">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                    <div className="text-xs text-muted-foreground">{c.phone}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm">{getFlag(c.countryCode)} {c.nationality}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">
                    {c.stats.totalBookings}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    €{c.stats.totalSpent}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.stats.lastBooking
                      ? format(new Date(c.stats.lastBooking), "dd MMM yyyy")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.stats.hasActiveRental ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] h-5">
                        Active
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="View Profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <a
                        href={`mailto:${c.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Email"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={`tel:${c.phone.replace(/\s/g, "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Call"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over */}
      <CustomerSlideOver
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};

export default AdminCustomersPage;
