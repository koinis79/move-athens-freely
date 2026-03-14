import { useState, useMemo } from "react";
import {
  Search, Download, ChevronUp, ChevronDown, Phone, Mail,
  Users, ArrowUpDown, MessageSquare, Send,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAdminCustomers, type AdminCustomer } from "@/hooks/useAdminCustomers";
import { useAdminBookings } from "@/hooks/useAdminBookings";

// ─── Status badge config ──────────────────────────────────────
const statusCls: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-orange-100 text-orange-800 border-orange-200",
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
  customer: AdminCustomer | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("history");
  const { bookings } = useAdminBookings({ search: customer?.customer_email });

  if (!customer) return null;

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-5 pb-0">
          <SheetTitle className="text-lg">{customer.customer_name}</SheetTitle>
        </SheetHeader>

        <div className="p-5 pt-3">
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="space-y-1.5">
              <a href={`mailto:${customer.customer_email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Mail className="h-3.5 w-3.5" /> {customer.customer_email}
              </a>
              {customer.customer_phone && (
                <a href={`tel:${customer.customer_phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {customer.customer_phone}
                </a>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{customer.totalBookings}</p>
                <p className="text-[11px] text-muted-foreground">Bookings</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">€{customer.totalSpent.toFixed(0)}</p>
                <p className="text-[11px] text-muted-foreground">Total Spent</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground mt-1">
                  {customer.firstBooking ? format(new Date(customer.firstBooking), "MMM yyyy") : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">Member Since</p>
              </div>
            </div>
            {customer.hasActiveRental && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">Active Rental</Badge>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="px-5">
          <TabsList className="w-full grid grid-cols-2 h-9">
            <TabsTrigger value="history" className="text-xs">Bookings</TabsTrigger>
            <TabsTrigger value="comms" className="text-xs">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-3 space-y-2 pb-6">
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No bookings found.</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-muted-foreground">{b.booking_number}</span>
                    <Badge variant="outline" className={cn("text-[10px] h-5", statusCls[b.status] ?? "")}>
                      {b.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {b.booking_items?.[0]?.equipment?.name_en ?? "Equipment"}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(b.rental_start + "T00:00:00"), "dd MMM")} – {format(new Date(b.rental_end + "T00:00:00"), "dd MMM yyyy")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">€{Number(b.total_amount).toFixed(0)}</span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

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
  const { customers, loading } = useAdminCustomers();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  }, []);

  const filtered = useMemo(() => {
    let list = [...customers];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.customer_name.toLowerCase().includes(q) ||
        c.customer_email.toLowerCase().includes(q) ||
        (c.customer_phone ?? "").includes(q)
      );
    }

    if (filter === "active") list = list.filter((c) => c.hasActiveRental);
    if (filter === "repeat") list = list.filter((c) => c.totalBookings >= 2);
    if (filter === "recent") list = list.filter((c) => c.lastBooking && c.lastBooking >= thirtyDaysAgo);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name": cmp = a.customer_name.localeCompare(b.customer_name); break;
        case "totalBookings": cmp = a.totalBookings - b.totalBookings; break;
        case "totalSpent": cmp = a.totalSpent - b.totalSpent; break;
        case "lastBooking": cmp = (a.lastBooking ?? "").localeCompare(b.lastBooking ?? ""); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [customers, search, filter, sortBy, sortDir, thirtyDaysAgo]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Customers</h1>
          <Badge variant="secondary" className="text-xs ml-1">{filtered.length}</Badge>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email or phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="active">Active Rental</SelectItem>
            <SelectItem value="repeat">Repeat (2+)</SelectItem>
            <SelectItem value="recent">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortKey); setSortDir("asc"); }}>
          <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="totalBookings">Total Bookings</SelectItem>
            <SelectItem value="lastBooking">Last Booking</SelectItem>
            <SelectItem value="totalSpent">Total Spent</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.customer_email} onClick={() => setSelectedCustomer(c)} className="hover:bg-muted/20 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{c.customer_name}</div>
                    <div className="text-xs text-muted-foreground lg:hidden">{c.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="text-xs text-muted-foreground">{c.customer_email}</div>
                    <div className="text-xs text-muted-foreground">{c.customer_phone ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">{c.totalBookings}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">€{c.totalSpent.toFixed(0)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.lastBooking ? format(new Date(c.lastBooking), "dd MMM yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.hasActiveRental ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] h-5">Active</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerSlideOver customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </div>
  );
};

export default AdminCustomersPage;
