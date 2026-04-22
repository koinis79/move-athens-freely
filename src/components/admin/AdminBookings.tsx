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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Archive, ArchiveRestore, MoreHorizontal, Search, Star, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


/** Convert any phone string to a wa.me number (digits only, no leading +) */
function toWhatsAppNumber(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

const STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "active", "completed", "cancelled"];

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
  review_requested_at: string | null;
  is_archived: boolean;
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
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [statusFilter, setStatusFilter] = useState("All");
  const [archiveTarget, setArchiveTarget] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [reviewSending, setReviewSending] = useState<Set<string>>(new Set());

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select(`
        id, booking_number, customer_name, customer_email, customer_phone,
        delivery_address, delivery_notes, rental_start, rental_end,
        total_amount, payment_status, status, internal_notes, is_archived, review_requested_at,
        delivery_zones ( name_en, delivery_fee ),
        booking_items ( quantity, num_days, subtotal, equipment ( name_en ) )
      `)
      .order("created_at", { ascending: false });
    setBookings((data as unknown as Booking[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings.filter((b) => {
    if (viewMode === "active" && b.is_archived) return false;
    if (viewMode === "archived" && !b.is_archived) return false;
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

  const setArchived = async (id: string, archived: boolean) => {
    const { error } = await supabase
      .from("bookings")
      .update({ is_archived: archived })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: archived ? "Booking archived" : "Booking restored" });
    setArchiveTarget(null);
    fetchBookings();
  };

  const openDetail = (b: Booking) => {
    setSelected(b);
    setEditStatus(b.status);
    setEditNotes(b.internal_notes ?? "");
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", bookingId);
    if (error) {
      toast({ title: "Error", description: "Failed to update booking status", variant: "destructive" });
      console.error(error);
      return;
    }
    const label = newStatus.replace(/_/g, " ");
    toast({ title: "Status updated", description: `Booking marked as ${label}` });
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  const sendReviewRequest = async (booking: Booking) => {
    setReviewSending((prev) => new Set(prev).add(booking.id));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");
      const res = await fetch(
        "https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-review-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ booking_id: booking.id }),
        }
      );
      if (res.status === 409) {
        toast({ title: "Already sent", description: "A review request was already sent for this booking." });
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Unknown error");
      }
      toast({ title: "Review request sent", description: `Email sent to ${booking.customer_email}` });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, review_requested_at: new Date().toISOString() } : b
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send review request";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setReviewSending((prev) => {
        const next = new Set(prev);
        next.delete(booking.id);
        return next;
      });
    }
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

      {/* Active / Archived tabs */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setViewMode("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            viewMode === "active"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Active
          <span className="ml-2 text-xs text-muted-foreground">
            ({bookings.filter(b => !b.is_archived).length})
          </span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode("archived")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            viewMode === "archived"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Archived
          <span className="ml-2 text-xs text-muted-foreground">
            ({bookings.filter(b => b.is_archived).length})
          </span>
        </button>
      </div>

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
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((__, j) => (
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
                        {b.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">€{Number(b.total_amount).toFixed(0)}</TableCell>
                    <TableCell onClick={(e) => { e.stopPropagation(); }}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "confirmed")}>
                            Mark as Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "preparing")}>
                            Mark as Preparing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "out_for_delivery")}>
                            Mark as Out for Delivery
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "delivered")}>
                            Mark as Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "completed")}>
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {(b.status === "completed" || b.status === "delivered") && (
                            <DropdownMenuItem
                              disabled={!!b.review_requested_at || reviewSending.has(b.id)}
                              onClick={() => sendReviewRequest(b)}
                              className="gap-2"
                            >
                              <Star className="h-3.5 w-3.5" />
                              {b.review_requested_at
                                ? "Review Sent ✓"
                                : reviewSending.has(b.id)
                                ? "Sending…"
                                : "Request Review"}
                            </DropdownMenuItem>
                          )}
                          {b.is_archived ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setArchived(b.id, false)} className="gap-2">
                                <ArchiveRestore className="h-3.5 w-3.5" />
                                Restore Booking
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              {(b.status === "completed" || b.status === "cancelled") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setArchiveTarget(b)} className="gap-2">
                                    <Archive className="h-3.5 w-3.5" />
                                    Archive
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setCancelTarget(b)}
                              >
                                Cancel Booking
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Archive confirmation dialog */}
      <Dialog open={!!archiveTarget} onOpenChange={() => setArchiveTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive this booking?</DialogTitle>
            <DialogDescription>
              This will archive <span className="font-mono font-semibold">{archiveTarget?.booking_number}</span> and move it to the Archived tab. You can restore it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveTarget(null)}>Back</Button>
            <Button
              onClick={() => archiveTarget && setArchived(archiveTarget.id, true)}
            >
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel booking?</DialogTitle>
            <DialogDescription>
              This will mark <span className="font-mono font-semibold">{cancelTarget?.booking_number}</span> as cancelled. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>Keep Booking</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (cancelTarget) {
                  updateBookingStatus(cancelTarget.id, "cancelled");
                  setCancelTarget(null);
                }
              }}
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{selected.customer_phone ?? "—"}</p>
                    {selected.customer_phone && (
                      <a
                        href={`https://wa.me/${toWhatsAppNumber(selected.customer_phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
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
