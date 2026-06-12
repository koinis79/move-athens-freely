import { useState, useEffect, useMemo } from "react";
import { format, addDays, differenceInDays } from "date-fns";
import {
  User, Check, ChevronRight, ChevronLeft,
  Package, CalendarIcon, CreditCard, Minus, Plus, MapPin, Loader2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/* ── Static helpers ─────────────────────────────────────── */

const TIME_SLOTS = [
  { value: "morning", label: "Morning (08:00 – 12:00)" },
  { value: "afternoon", label: "Afternoon (12:00 – 17:00)" },
  { value: "evening", label: "Evening (17:00 – 21:00)" },
];

/** Pick the correct price tier for a given number of rental days */
function tierPrice(eq: EquipmentRow, days: number): number {
  if (days <= 3) return eq.price_tier1;
  if (days <= 7) return eq.price_tier2;
  if (days <= 14) return eq.price_tier3;
  return eq.price_tier4;
}

/* ── Types ──────────────────────────────────────────────── */

interface EquipmentRow {
  id: string;
  name_en: string;
  slug: string;
  is_active: boolean;
  price_tier1: number;
  price_tier2: number;
  price_tier3: number;
  price_tier4: number;
  quantity_total: number;
  equipment_categories: { name_en: string } | null;
}

interface DeliveryZoneRow {
  id: string;
  name_en: string;
  slug: string;
  delivery_fee: number;
  is_active: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate?: Date;
}

/* ── Component ──────────────────────────────────────────── */

const NewBookingModal = ({ open, onOpenChange, defaultDate }: Props) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Data loaded from Supabase
  const [equipmentList, setEquipmentList] = useState<EquipmentRow[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Step 1 — Customer
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Step 2 — Equipment & Dates
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const tomorrow = useMemo(() => addDays(new Date(), 1), []);
  const [startDate, setStartDate] = useState<Date>(defaultDate ?? tomorrow);
  const [endDate, setEndDate] = useState<Date>(addDays(defaultDate ?? tomorrow, 3));
  const [deliveryZoneId, setDeliveryZoneId] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("morning");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Step 3 — Summary
  const [internalNotes, setInternalNotes] = useState("");

  // Load data when dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setDataLoading(true);
      const [eqRes, dzRes] = await Promise.all([
        supabase
          .from("equipment")
          .select("id, name_en, slug, is_active, price_tier1, price_tier2, price_tier3, price_tier4, quantity_total, equipment_categories(name_en)")
          .eq("is_active", true)
          .order("name_en"),
        supabase
          .from("delivery_zones")
          .select("id, name_en, slug, delivery_fee, is_active")
          .eq("is_active", true)
          .order("delivery_fee"),
      ]);
      if (cancelled) return;
      setEquipmentList((eqRes.data as EquipmentRow[]) ?? []);
      setDeliveryZones((dzRes.data as DeliveryZoneRow[]) ?? []);
      setDataLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [open]);

  // Computed values
  const selectedEquipment = equipmentList.find((e) => e.id === selectedEquipmentId) ?? null;
  const selectedZone = deliveryZones.find((z) => z.id === deliveryZoneId) ?? null;

  const duration = useMemo(() => {
    return Math.max(1, differenceInDays(endDate, startDate));
  }, [startDate, endDate]);

  const unitPrice = selectedEquipment ? tierPrice(selectedEquipment, duration) : 0;
  const subtotal = unitPrice * quantity;
  const deliveryFee = selectedZone?.delivery_fee ?? 0;
  const total = subtotal + deliveryFee;

  const tierLabel = duration <= 3 ? "1–3 days" : duration <= 7 ? "4–7 days" : duration <= 14 ? "8–14 days" : "15–30 days";

  // Validation
  const step1Valid = !!(customerName.trim() && customerEmail.trim());
  const step2Valid = !!selectedEquipment && !!deliveryZoneId && startDate < endDate;
  const canProceed = (s: number) => {
    if (s === 1) return step1Valid;
    if (s === 2) return step2Valid;
    return true;
  };

  const reset = () => {
    setStep(1);
    setSubmitting(false);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setSelectedEquipmentId("");
    setQuantity(1);
    setStartDate(defaultDate ?? tomorrow);
    setEndDate(addDays(defaultDate ?? tomorrow, 3));
    setDeliveryZoneId("");
    setDeliveryAddress("");
    setDeliveryTime("morning");
    setDeliveryNotes("");
    setInternalNotes("");
  };

  const handleCreate = async () => {
    if (!selectedEquipment || !deliveryZoneId) return;
    setSubmitting(true);
    try {
      const numDays = duration;

      // Build items payload (same structure as Checkout.tsx)
      const itemsPayload = [
        {
          equipment_id: selectedEquipment.id,
          quantity,
          num_days: numDays,
          price_per_day: unitPrice,
          subtotal: subtotal,
        },
      ];

      // Build availability payload — one record per day per equipment
      const availabilityPayload: { equipment_id: string; date: string; quantity_booked: number }[] = [];
      for (let d = 0; d < numDays; d++) {
        availabilityPayload.push({
          equipment_id: selectedEquipment.id,
          date: format(addDays(startDate, d), "yyyy-MM-dd"),
          quantity_booked: quantity,
        });
      }

      // 1. Call the server-validated create_booking RPC
      const { data, error: rpcErr } = await supabase.rpc("create_booking", {
        p_booking_number: "",
        p_user_id: null,
        p_customer_name: customerName.trim(),
        p_customer_email: customerEmail.trim(),
        p_customer_phone: customerPhone.trim() || null,
        p_delivery_zone_id: deliveryZoneId,
        p_delivery_address: deliveryAddress.trim() || null,
        p_delivery_time_slot: deliveryTime,
        p_delivery_notes: deliveryNotes.trim() || null,
        p_rental_start: format(startDate, "yyyy-MM-dd"),
        p_rental_end: format(endDate, "yyyy-MM-dd"),
        p_num_days: numDays,
        p_subtotal: subtotal,
        p_delivery_fee: deliveryFee,
        p_total_amount: total,
        p_items: itemsPayload,
        p_availability: availabilityPayload,
      });

      if (rpcErr || !data || (Array.isArray(data) && data.length === 0)) {
        throw new Error(rpcErr?.message ?? "Failed to create booking");
      }

      const row = Array.isArray(data) ? data[0] : data;
      const bookingId = row?.booking_id;
      const bookingNumber = row?.booking_number;

      if (!bookingId) throw new Error("No booking_id returned from RPC");

      // 2. Immediately mark as confirmed + paid (manual booking, no Stripe)
      const notesText = [
        "Manual booking (admin)",
        internalNotes.trim() || null,
      ].filter(Boolean).join(" — ");

      const { error: updateErr } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          payment_status: "paid",
          internal_notes: notesText,
        })
        .eq("id", bookingId);

      if (updateErr) {
        console.error("Failed to update booking status:", updateErr);
        // Non-fatal — booking was created, just stuck at pending
      }

      toast({
        title: "Booking Created",
        description: `${bookingNumber ?? "New booking"} for ${customerName.trim()} — confirmed & paid.`,
      });

      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Create booking error:", err);
      toast({
        title: "Failed to create booking",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  // ─── Steps ──────────────────────────────────────────────
  const STEPS = [
    { num: 1, label: "Customer", icon: User },
    { num: 2, label: "Equipment", icon: Package },
    { num: 3, label: "Confirm", icon: CreditCard },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-base">New Booking</DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                      step > s.num && "bg-primary text-primary-foreground",
                      step === s.num && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      step < s.num && "bg-muted text-muted-foreground",
                    )}
                  >
                    {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span className={cn("text-[10px] font-medium", step >= s.num ? "text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-px w-16 sm:w-24 mx-1 mt-[-14px]", step > s.num ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-220px)] min-h-[280px]">

          {/* ─── Step 1: Customer ─── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Full Name *</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="e.g. John Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    className="h-9 text-sm"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Phone (optional)</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="+44 7700 900000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Equipment & Details ─── */}
          {step === 2 && (
            <div className="space-y-4">
              {dataLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Equipment selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Equipment *</Label>
                    <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select equipment…" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentList.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id} className="text-sm">
                            {eq.name_en}
                            <span className="text-muted-foreground ml-1">
                              — €{eq.price_tier1}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  {selectedEquipment && (
                    <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedEquipment.name_en}</p>
                        <p className="text-xs text-muted-foreground">
                          €{unitPrice} ({tierLabel}) × {quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Qty:</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold w-6 text-center text-foreground">{quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQuantity((q) => q + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left h-9 text-sm font-normal">
                            <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            {format(startDate, "dd MMM yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(d) => {
                              if (d) {
                                setStartDate(d);
                                if (d >= endDate) setEndDate(addDays(d, 1));
                              }
                            }}
                            disabled={(d) => d < new Date()}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">End Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left h-9 text-sm font-normal">
                            <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            {format(endDate, "dd MMM yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(d) => d && setEndDate(d)}
                            disabled={(d) => d <= startDate}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
                    <span className="text-sm font-semibold text-foreground">{duration} day{duration > 1 ? "s" : ""}</span>
                    <span className="text-xs text-muted-foreground ml-1">· {tierLabel} pricing tier</span>
                  </div>

                  {/* Delivery zone */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Delivery Zone *</Label>
                    <Select value={deliveryZoneId} onValueChange={setDeliveryZoneId}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select delivery zone…" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryZones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id} className="text-sm">
                            {zone.name_en}
                            <span className="text-muted-foreground ml-1">
                              {zone.delivery_fee > 0 ? `— €${zone.delivery_fee}` : "— Free"}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Delivery Address</Label>
                    <Input
                      placeholder="Hotel name and full address…"
                      className="h-9 text-sm"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>

                  {/* Time slot */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Preferred Delivery Time</Label>
                    <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delivery notes */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Delivery Notes</Label>
                    <Textarea
                      placeholder="Ground floor, no steps, leave with reception…"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="text-sm min-h-[60px]"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── Step 3: Summary & Confirm ─── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-muted/40 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order Summary</h4>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium text-foreground">{customerName.trim()}</span>
                </div>
                {customerEmail && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground text-xs">{customerEmail.trim()}</span>
                  </div>
                )}
                {customerPhone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium text-foreground text-xs">{customerPhone.trim()}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Equipment</span>
                  <span className="font-medium text-foreground">
                    {selectedEquipment?.name_en}{quantity > 1 ? ` ×${quantity}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rental Period</span>
                  <span className="font-medium text-foreground">
                    {format(startDate, "dd MMM")} – {format(endDate, "dd MMM yyyy")} ({duration}d)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Zone</span>
                  <span className="font-medium text-foreground">{selectedZone?.name_en ?? "—"}</span>
                </div>
                {deliveryAddress && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-foreground truncate max-w-[200px]">{deliveryAddress}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    €{unitPrice} ({tierLabel}){quantity > 1 ? ` × ${quantity}` : ""}
                  </span>
                  <span className="text-foreground">€{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-foreground">{deliveryFee > 0 ? `€${deliveryFee}` : "Free"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">€{total}</span>
                </div>
              </div>

              {/* Internal notes */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Internal Notes (admin only)</Label>
                <Textarea
                  placeholder="e.g. Phone order, paid cash, repeat customer…"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="text-sm min-h-[50px]"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                <strong>Note:</strong> This booking will be created as <strong>Confirmed + Paid</strong> (manual/phone order).
                It will appear in the bookings list immediately and follow the normal status workflow.
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="px-6 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={submitting}
            onClick={() => (step === 1 ? handleClose(false) : setStep((s) => s - 1))}
          >
            {step === 1 ? (
              "Cancel"
            ) : (
              <><ChevronLeft className="h-3 w-3 mr-1" /> Back</>
            )}
          </Button>

          {step < 3 ? (
            <Button
              size="sm"
              className="text-xs"
              disabled={!canProceed(step)}
              onClick={() => setStep((s) => s + 1)}
            >
              Next <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={submitting}
              onClick={handleCreate}
            >
              {submitting ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Creating…</>
              ) : (
                "Create Booking"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewBookingModal;
