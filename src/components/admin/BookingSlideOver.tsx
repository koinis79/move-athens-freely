import { format } from "date-fns";
import {
  X, Phone, Mail, MapPin, Clock, CreditCard, Euro,
  CheckCircle2, Truck, PackageCheck, XCircle, MessageSquare, Send,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type BookingDetail, getFlag } from "@/data/adminBookingsMockData";
import type { BookingStatus } from "@/data/adminDashboardMockData";

const statusConfig: Record<BookingStatus, { label: string; cls: string }> = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmed", cls: "bg-blue-100 text-blue-800 border-blue-200" },
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

/* ── Timeline Steps ── */
const timelineSteps: { key: string; label: string; dateKey: keyof BookingDetail }[] = [
  { key: "requested", label: "Requested", dateKey: "createdAt" },
  { key: "confirmed", label: "Confirmed", dateKey: "confirmedAt" },
  { key: "delivered", label: "Delivered", dateKey: "deliveredAt" },
  { key: "pickedUp", label: "Picked Up", dateKey: "pickedUpAt" },
  { key: "completed", label: "Completed", dateKey: "completedAt" },
];

const fmtTs = (iso: string | null) => {
  if (!iso) return null;
  return format(new Date(iso), "dd MMM yyyy, HH:mm");
};

const fmtShort = (d: string) => format(new Date(d + (d.includes("T") ? "" : "T00:00:00")), "dd MMM yyyy");

interface Props {
  booking: BookingDetail | null;
  onClose: () => void;
}

const BookingSlideOver = ({ booking, onClose }: Props) => {
  const [newNote, setNewNote] = useState("");

  if (!booking) return null;

  const b = booking;
  const sc = statusConfig[b.status];
  const days = Math.round(
    (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86400000
  );

  /* Determine which actions to show */
  const showConfirm = b.status === "pending";
  const showDeliver = b.status === "confirmed";
  const showPickup = b.status === "delivered";
  const showCancel = b.status !== "completed" && b.status !== "cancelled";

  return (
    <Sheet open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 z-10 bg-white border-b border-[#E2E4E9] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-bold text-[#1A202C]">{b.bookingId}</SheetTitle>
              <p className="text-xs text-[#A0AEC0] mt-0.5">Created {fmtTs(b.createdAt)}</p>
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
              <p className="font-semibold text-[#1A202C]">{getFlag(b.countryCode)} {b.customerName}</p>
              <InfoRow icon={Mail} label={b.customerEmail} href={`mailto:${b.customerEmail}`} />
              <InfoRow icon={Phone} label={b.phone} href={`tel:${b.phone.replace(/\s/g, "")}`} />
              <p className="text-xs text-[#A0AEC0]">{b.nationality}</p>
            </div>
          </Section>

          <Separator />

          {/* ── Equipment ── */}
          <Section title="Equipment">
            <div className="flex gap-3">
              <div className="h-16 w-16 rounded-lg bg-[#F4F5F7] flex items-center justify-center text-[11px] text-[#A0AEC0] shrink-0">IMG</div>
              <div>
                <p className="font-semibold text-[#1A202C]">{b.equipment}</p>
                <p className="text-sm text-[#718096]">€{b.dailyRate}/day × {days} days</p>
                <p className="text-lg font-bold text-[#1A202C] mt-1">€{b.amount}</p>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── Rental Timeline ── */}
          <Section title="Rental Timeline">
            {b.status === "cancelled" ? (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <XCircle className="h-4 w-4" />
                Cancelled {fmtTs(b.cancelledAt)}
              </div>
            ) : (
              <div className="flex items-center gap-0">
                {timelineSteps.map((step, i) => {
                  const dateVal = b[step.dateKey] as string | null;
                  const reached = !!dateVal;
                  const isLast = i === timelineSteps.length - 1;
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2",
                            reached
                              ? "bg-[#1B4965] border-[#1B4965] text-white"
                              : "bg-white border-[#E2E4E9] text-[#A0AEC0]"
                          )}
                        >
                          {reached ? "✓" : i + 1}
                        </div>
                        <span className={cn("text-[10px] mt-1 whitespace-nowrap", reached ? "text-[#1A202C] font-medium" : "text-[#A0AEC0]")}>
                          {step.label}
                        </span>
                        {reached && (
                          <span className="text-[9px] text-[#A0AEC0]">{format(new Date(dateVal!), "dd/MM")}</span>
                        )}
                      </div>
                      {!isLast && (
                        <div className={cn("h-0.5 w-6 mx-0.5 mb-6", reached ? "bg-[#1B4965]" : "bg-[#E2E4E9]")} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <Separator />

          {/* ── Delivery Details ── */}
          <Section title="Delivery Details">
            <div className="space-y-2">
              <InfoRow icon={MapPin} label={b.deliveryAddress} />
              <InfoRow icon={Clock} label={`Preferred time: ${b.deliveryTime}`} />
              {b.specialInstructions && (
                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-900 mt-2">
                  <span className="font-medium">Instructions:</span> {b.specialInstructions}
                </div>
              )}
            </div>
          </Section>

          <Separator />

          {/* ── Payment ── */}
          <Section title="Payment">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <InfoRow icon={CreditCard} label={b.paymentMethod} />
                <InfoRow icon={Euro} label={`€${b.amount} total`} />
              </div>
              <Badge className={cn("text-xs font-semibold capitalize", paymentStatusCls[b.paymentStatus])}>
                {b.paymentStatus}
              </Badge>
            </div>
          </Section>

          <Separator />

          {/* ── Contact ── */}
          <Section title="Contact Customer">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={`tel:${b.phone.replace(/\s/g, "")}`}><Phone className="h-3.5 w-3.5 mr-1.5" /> Call</a>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={`mailto:${b.customerEmail}`}><Mail className="h-3.5 w-3.5 mr-1.5" /> Email</a>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={`https://wa.me/${b.phone.replace(/[\s+]/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
                </a>
              </Button>
            </div>
          </Section>

          <Separator />

          {/* ── Notes / Activity Log ── */}
          <Section title="Notes & Activity">
            <div className="space-y-3 mb-3 max-h-[200px] overflow-y-auto">
              {b.notes.map((n) => (
                <div key={n.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1A202C]">{n.author}</span>
                    <span className="text-[10px] text-[#A0AEC0]">{fmtTs(n.timestamp)}</span>
                  </div>
                  <p className="text-[#4A5568] mt-0.5">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a note…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[60px] border-[#E2E4E9] text-sm"
              />
              <Button variant="outline" size="icon" className="shrink-0 h-[60px] w-10" disabled={!newNote.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Section>
        </div>

        {/* ── Action Buttons ── */}
        <div className="sticky bottom-0 bg-white border-t border-[#E2E4E9] px-6 py-4 flex flex-wrap gap-2">
          {showConfirm && (
            <Button className="bg-[#1B4965] hover:bg-[#163d55] text-white flex-1">
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm
            </Button>
          )}
          {showDeliver && (
            <Button className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white flex-1">
              <Truck className="h-4 w-4 mr-1.5" /> Mark Delivered
            </Button>
          )}
          {showPickup && (
            <Button className="bg-[#6B8F71] hover:bg-[#5a7a5f] text-white flex-1">
              <PackageCheck className="h-4 w-4 mr-1.5" /> Mark Picked Up
            </Button>
          )}
          {showCancel && (
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 flex-1">
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
    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0AEC0] mb-3">{title}</h3>
    {children}
  </div>
);

const InfoRow = ({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href?: string }) => {
  const content = (
    <span className="inline-flex items-center gap-2 text-sm text-[#4A5568]">
      <Icon className="h-3.5 w-3.5 text-[#A0AEC0] shrink-0" />
      {label}
    </span>
  );
  if (href) return <a href={href} className="hover:underline block">{content}</a>;
  return <div>{content}</div>;
};

export default BookingSlideOver;
