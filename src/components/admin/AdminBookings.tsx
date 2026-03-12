import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["pending", "confirmed", "active", "completed", "cancelled"];

const statusColor: Record<string, string> = {
  pending:   "bg-secondary/15 text-secondary border-secondary/30",
  confirmed: "bg-primary/15 text-primary border-primary/30",
  active:    "bg-accent/15 text-accent border-accent/30",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

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
  delivery_zones: { name_en: string; delivery_fee: number } | null;
  booking_items: {
    quantity: number;
    num_days: number;
    subtotal: number;
    equipment: { name_en: string } | null;
  }[];
}

const AdminBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select(`
        id, booking_number, customer_name, customer_email, customer_phone,
        delivery_address, delivery_notes, rental_start, rental_end,
        total_amount, payment_status, status, internal_notes,
        delivery_zones ( name_en, delivery_fee ),
        booking_items ( quantity, num_days, subtotal, equipment ( name_en ) )
      `)
      .order("created_at", { ascending: false });
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "All" && b.status !== statusFilter) return false;
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

  const openDetail = (b: Booking) => {
    setSelected(b);
    setEditStatus(b.status);
    setEditNotes(b.internal_notes ?? "");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: editStatus, internal_notes: editNotes })
      .eq("id", selected.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking updated", description: `Status set to ${editStatus}` });
      setSelected(null);
      fetchBookings();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">All Bookings</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by booking #, name, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((b) => (
                  <TableRow key={b.id} className="cursor-pointer" onClick={() => openDetail(b)}>
                    <TableCell className="font-mono text-xs">{b.booking_number}</TableCell>
                    <TableCell>{b.customer_name}</TableCell>
                    <TableCell>
                      {b.booking_items?.[0]?.equipment?.name_en ?? "—"}
                      {b.booking_items?.length > 1 ? ` +${b.booking_items.length - 1}` : ""}
                    </TableCell>
                    <TableCell className="text-xs">{b.rental_start} → {b.rental_end}</TableCell>
                    <TableCell className="text-xs">{b.delivery_zones?.name_en ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs capitalize",
                        b.payment_status === "paid"
                          ? "bg-accent/15 text-accent border-accent/30"
                          : "bg-secondary/15 text-secondary border-secondary/30"
                      )}>
                        {b.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs capitalize", statusColor[b.status])}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">€{Number(b.total_amount).toFixed(0)}</TableCell>
                  </TableRow>
                ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">{selected?.booking_number}</DialogTitle>
            <DialogDescription>Booking details and management</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selected.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selected.customer_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selected.customer_phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">{selected.payment_status}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Items</p>
                <ul className="space-y-1">
                  {selected.booking_items.map((item, i) => (
                    <li key={i} className="font-medium">
                      {item.equipment?.name_en ?? "Unknown"} × {item.quantity} · {item.num_days}d · €{item.subtotal}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-muted-foreground">Rental Period</p>
                <p className="font-medium">{selected.rental_start} → {selected.rental_end}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Delivery Zone</p>
                <p className="font-medium">{selected.delivery_zones?.name_en ?? "—"}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Delivery Address</p>
                <p className="font-medium">{selected.delivery_address ?? "—"}</p>
                {selected.delivery_notes && (
                  <p className="text-muted-foreground italic mt-1">{selected.delivery_notes}</p>
                )}
              </div>

              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-medium text-lg">€{Number(selected.total_amount).toFixed(0)}</p>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Internal Notes</label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes…"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
