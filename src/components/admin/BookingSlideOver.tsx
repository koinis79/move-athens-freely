import { format } from "date-fns";
import {
  Phone, Mail, MapPin, Clock, CreditCard, Euro,
  CheckCircle2, Truck, PackageCheck, XCircle, MessageSquare, Send,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AdminBooking } from "@/hooks/useAdminBookings";

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmed", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  active:    { label: "Active",    cls: "bg-orange-100 text-orange-800 border-orange-200" },
  delivered: { label: "Delivered", cls: "bg-orange-100 text-orange-800 border-orange-200" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800 border-red-200" },
};

const paymentStatusCls: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  partial: "bg-blue-100 text-blue-800",
  refunded: "bg-red-100 text-red-800",
};

const fmtTs = (iso: string | null) => {
  if (!iso) return null;
  return format(new Date(iso), "dd MMM yyyy, HH:mm");
};

const fmtShort = (d: string) => format(new Date(d + (d.includes("T") ? "" : "T00:00:00")), "dd MMM yyyy");

interface Props {
  booking: AdminBooking | null;
  onClose: () => void;
}

const BookingSlideOver = ({ booking, onClose }: Props) => {
  const [newNote, setNewNote] = useState("");

  if (!booking) return null;

  const b = booking;
  const sc = statusConfig[b.status] ?? statusConfig.pending;
  const equipmentName = b.booking_items?.[0]?.equipment?.name_en ?? "Unknown Equipment";

  const handleStatusUpdate = async (newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", b.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Booking ${b.booking_number} → ${newStatus}` });
      onClose();
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    const existingNotes = b.internal_notes ?? "";
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm");
    const updated = `${existingNotes}\n[${timestamp}] ${newNote.trim()}`.trim();

    const { error } = await supabase
      .from("bookings")
      .update({ internal_notes: updated })
      .eq("id", b.id);

    if (error) {
      toast({ title: "Error saving note", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Note saved" });
      setNewNote("");
    }
  };

  const showConfirm = b.status === "pending";
  const showDeliver = b.status === "confirmed";
  const showPickup = b.status === "delivered" || b.status === "active";
  const showCancel = b.status !== "completed" && b.status !== "cancelled";

  return (
    <Sheet open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">{b.booking_number}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Created {fmtTs(b.created_at)}</p>
            </div>
            <Badge variant="outline" className={cn("text-xs font-semibold border", sc.cls)}>
              {sc.label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="px-6 py-5 space-y-6">

          {/* ── Customer ── */}
          <Section title="Customer">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">{b.customer_name}</p>
              <InfoRow icon={Mail} label={b.customer_email} href={`mailto:${b.customer_email}`} />
              {b.customer_phone && <InfoRow icon={Phone} label={b.customer_phone} href={`tel:${b.customer_phone.replace(/\s/g, "")}`} />}
            </div>
          </Section>

          <Separator />

          {/* ── Equipment ── */}
          <Section title="Equipment">
            {b.booking_items?.map((item) => (
              <div key={item.id} className="flex gap-3 mb-2">
                <div>
                  <p className="font-semibold text-foreground">{item.equipment?.name_en ?? "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">€{Number(item.price_per_day).toFixed(0)}/day × {item.num_days} days × {item.quantity}</p>
                  <p className="text-sm font-bold text-foreground">€{Number(item.subtotal).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </Section>

          <Separator />

          {/* ── Rental Period ── */}
          <Section title="Rental Period">
            <div className="space-y-2">
              <p className="text-sm text-foreground">{fmtShort(b.rental_start)} → {fmtShort(b.rental_end)}</p>
              <p className="text-xs text-muted-foreground">{b.num_days} day{b.num_days !== 1 ? "s" : ""}</p>
            </div>
          </Section>

          <Separator />

          {/* ── Delivery Details ── */}
          <Section title="Delivery Details">
            <div className="space-y-2">
              {b.delivery_address && <InfoRow icon={MapPin} label={b.delivery_address} />}
              {b.delivery_time_slot && <InfoRow icon={Clock} label={`Preferred time: ${b.delivery_time_slot}`} />}
              {b.special_requirements && (
                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-900 mt-2">
                  <span className="font-medium">Instructions:</span> {b.special_requirements}
                </div>
              )}
            </div>
          </Section>

          <Separator />

          {/* ── Payment ── */}
          <Section title="Payment">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <InfoRow icon={Euro} label={`€${Number(b.total_amount).toFixed(2)} total`} />
                {b.delivery_fee > 0 && (
                  <p className="text-xs text-muted-foreground ml-6">includes €{Number(b.delivery_fee).toFixed(0)} delivery</p>
                )}
              </div>
              <Badge className={cn("text-xs font-semibold capitalize", paymentStatusCls[b.payment_status] ?? paymentStatusCls.pending)}>
                {b.payment_status}
              </Badge>
            </div>
          </Section>

          <Separator />

          {/* ── Contact ── */}
          <Section title="Contact Customer">
            <div className="flex gap-2">
              {b.customer_phone && (
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a href={`tel:${b.customer_phone.replace(/\s/g, "")}`}><Phone className="h-3.5 w-3.5 mr-1.5" /> Call</a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={`mailto:${b.customer_email}`}><Mail className="h-3.5 w-3.5 mr-1.5" /> Email</a>
              </Button>
              {b.customer_phone && (
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a href={`https://wa.me/${b.customer_phone.replace(/[\s+]/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </Section>

          <Separator />

          {/* ── Notes ── */}
          <Section title="Internal Notes">
            {b.internal_notes && (
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap mb-3 bg-muted/30 rounded-lg p-3">
                {b.internal_notes}
              </pre>
            )}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a note…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <Button variant="outline" size="icon" className="shrink-0 h-[60px] w-10" disabled={!newNote.trim()} onClick={handleSaveNote}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Section>
        </div>

        {/* ── Action Buttons ── */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex flex-wrap gap-2">
          {showConfirm && (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1" onClick={() => handleStatusUpdate("confirmed")}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm
            </Button>
          )}
          {showDeliver && (
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex-1" onClick={() => handleStatusUpdate("delivered")}>
              <Truck className="h-4 w-4 mr-1.5" /> Mark Delivered
            </Button>
          )}
          {showPickup && (
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1" onClick={() => handleStatusUpdate("completed")}>
              <PackageCheck className="h-4 w-4 mr-1.5" /> Mark Completed
            </Button>
          )}
          {showCancel && (
            <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 flex-1" onClick={() => handleStatusUpdate("cancelled")}>
              <XCircle className="h-4 w-4 mr-1.5" /> Cancel
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

/* ── Helper components ── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
    {children}
  </div>
);

const InfoRow = ({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href?: string }) => {
  const content = (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </span>
  );
  if (href) return <a href={href} className="hover:underline block">{content}</a>;
  return <div>{content}</div>;
};

export default BookingSlideOver;
