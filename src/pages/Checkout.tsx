import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getPriceForDays } from "@/data/equipment";

interface DeliveryZone {
  id: string;
  name_en: string;
  slug: string;
  delivery_fee: number;
  estimated_time: string | null;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  hotelName: string;
  address: string;
  deliveryZoneId: string;
  deliveryTimeSlot: string;
  deliveryNotes: string;
  agreeTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    hotelName: "",
    address: "",
    deliveryZoneId: "",
    deliveryTimeSlot: "morning",
    deliveryNotes: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Pre-fill from logged-in user
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm((f) => ({
            ...f,
            name: data.full_name ?? f.name,
            email: data.email ?? user.email ?? f.email,
            phone: data.phone ?? f.phone,
          }));
        }
      });
  }, [user]);

  // Fetch delivery zones
  useEffect(() => {
    supabase
      .from("delivery_zones")
      .select("id, name_en, slug, delivery_fee, estimated_time")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setZones(data as DeliveryZone[]);
      });
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) navigate("/equipment");
  }, [items, navigate]);

  // ── Pricing calculations ─────────────────────────────────────────────────
  const lineItems = useMemo(
    () =>
      items.map((item) => {
        const days = Math.max(1, differenceInDays(item.endDate, item.startDate));
        const subtotal = getPriceForDays(item.equipment, days) * item.quantity;
        return { ...item, days, subtotal };
      }),
    [items]
  );

  const equipmentTotal = lineItems.reduce((s, i) => s + i.subtotal, 0);
  const selectedZone = zones.find((z) => z.id === form.deliveryZoneId);
  const deliveryFee = selectedZone?.delivery_fee ?? 0;
  const total = equipmentTotal + deliveryFee;

  // Rental date range across all items
  const rentalStart = useMemo(
    () =>
      items.length
        ? new Date(Math.min(...items.map((i) => i.startDate.getTime())))
        : new Date(),
    [items]
  );
  const rentalEnd = useMemo(
    () =>
      items.length
        ? new Date(Math.max(...items.map((i) => i.endDate.getTime())))
        : new Date(),
    [items]
  );

  // ── Form helpers ─────────────────────────────────────────────────────────
  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Valid email is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.hotelName.trim()) errs.hotelName = "Hotel or accommodation name is required";
    if (!form.address.trim()) errs.address = "Delivery address is required";
    if (!form.deliveryZoneId) errs.deliveryZoneId = "Please select a delivery zone";
    if (!form.agreeTerms) errs.agreeTerms = "You must agree to the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Build items payload
      const itemsPayload = lineItems.map((line) => ({
        equipment_id: line.equipment.id,
        quantity: line.quantity,
        price_per_day: line.equipment.priceTier1,
        num_days: line.days,
        subtotal: line.subtotal,
      }));

      // Build availability payload
      const availabilityPayload: { equipment_id: string; date: string; quantity_booked: number }[] = [];
      for (const line of lineItems) {
        const days = differenceInDays(line.endDate, line.startDate);
        for (let d = 0; d < days; d++) {
          const date = new Date(line.startDate);
          date.setDate(date.getDate() + d);
          availabilityPayload.push({
            equipment_id: line.equipment.id,
            date: format(date, "yyyy-MM-dd"),
            quantity_booked: line.quantity,
          });
        }
      }

      // Call SECURITY DEFINER function — bypasses RLS for INSERT + RETURNING
      const { data, error: rpcErr } = await supabase.rpc("create_booking", {
        p_booking_number: "",
        p_user_id: user?.id ?? null,
        p_customer_name: form.name.trim(),
        p_customer_email: form.email.trim(),
        p_customer_phone: form.phone.trim(),
        p_delivery_zone_id: form.deliveryZoneId || null,
        p_delivery_address: `${form.hotelName.trim()}, ${form.address.trim()}`,
        p_delivery_time_slot: form.deliveryTimeSlot,
        p_delivery_notes: form.deliveryNotes.trim() || null,
        p_rental_start: format(rentalStart, "yyyy-MM-dd"),
        p_rental_end: format(rentalEnd, "yyyy-MM-dd"),
        p_num_days: Math.max(1, differenceInDays(rentalEnd, rentalStart)),
        p_subtotal: equipmentTotal,
        p_delivery_fee: deliveryFee,
        p_total_amount: total,
        p_items: itemsPayload,
        p_availability: availabilityPayload,
      });

      if (rpcErr || !data || data.length === 0) {
        throw new Error(rpcErr?.message ?? "Failed to create booking");
      }

      const bookingNumber = data[0].booking_number;
      clearCart();

      // Call edge function to create Stripe Checkout Session
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL ?? "https://lmgpuqgwkiapgpdsxvmb.supabase.co"}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ3B1cWd3a2lhcGdwZHN4dm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjc1NzksImV4cCI6MjA4Nzk0MzU3OX0.WTs1-rimMSZtPoedl7qgxiWXGOJm8-yMaUEKfU7XuCI",
            ...(supabaseSession?.access_token
              ? { Authorization: `Bearer ${supabaseSession.access_token}` }
              : {}),
          },
          body: JSON.stringify({ booking_number: bookingNumber }),
        }
      );

      const result = await res.json();
      if (!res.ok || !result.url) {
        throw new Error(result.error ?? "Failed to create payment session");
      }

      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } catch (err: any) {
      setSubmitError(err.message ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container py-10 md:py-16">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground flex items-center gap-1.5">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>&gt;</span>
        <Link to="/cart" className="hover:text-primary transition-colors">Cart</Link>
        <span>&gt;</span>
        <span className="text-foreground font-medium">Checkout</span>
      </nav>

      <h1 className="text-3xl font-heading font-bold text-foreground mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ── Left: form ──────────────────────────────────────────────── */}
          <div className="space-y-8">
            {/* Customer info */}
            <section className="rounded-2xl border bg-card p-6 space-y-4">
              <h2 className="font-heading font-semibold text-lg text-foreground">
                Your Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Sarah Mitchell"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Delivery details */}
            <section className="rounded-2xl border bg-card p-6 space-y-4">
              <h2 className="font-heading font-semibold text-lg text-foreground">
                Delivery Details
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="hotelName">Hotel / Accommodation Name *</Label>
                <Input
                  id="hotelName"
                  placeholder="e.g. Hotel Grande Bretagne"
                  value={form.hotelName}
                  onChange={(e) => set("hotelName", e.target.value)}
                  className={errors.hotelName ? "border-destructive" : ""}
                />
                {errors.hotelName && (
                  <p className="text-xs text-destructive">{errors.hotelName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  placeholder="e.g. Vasileos Georgiou A 1, Syntagma, Athens"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="zone">Delivery Zone *</Label>
                <Select
                  value={form.deliveryZoneId}
                  onValueChange={(v) => set("deliveryZoneId", v)}
                >
                  <SelectTrigger
                    id="zone"
                    className={errors.deliveryZoneId ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select your area" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name_en}
                        {z.delivery_fee === 0
                          ? " — Free"
                          : ` — €${z.delivery_fee}`}
                        {z.estimated_time ? ` · ${z.estimated_time}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.deliveryZoneId && (
                  <p className="text-xs text-destructive">{errors.deliveryZoneId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Preferred Delivery Time</Label>
                <RadioGroup
                  value={form.deliveryTimeSlot}
                  onValueChange={(v) => set("deliveryTimeSlot", v)}
                  className="grid sm:grid-cols-3 gap-3"
                >
                  {[
                    { value: "morning", label: "Morning", sub: "08:00 – 12:00" },
                    { value: "afternoon", label: "Afternoon", sub: "12:00 – 16:00" },
                    { value: "evening", label: "Evening", sub: "16:00 – 20:00" },
                  ].map(({ value, label, sub }) => (
                    <label
                      key={value}
                      htmlFor={`slot-${value}`}
                      className={`flex flex-col gap-0.5 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                        form.deliveryTimeSlot === value
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={value}
                        id={`slot-${value}`}
                        className="sr-only"
                      />
                      <span className="font-semibold text-sm text-foreground">
                        {label}
                      </span>
                      <span className="text-xs text-muted-foreground">{sub}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Special Instructions (optional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="e.g. Leave at hotel reception, call on arrival, need a ramp..."
                  value={form.deliveryNotes}
                  onChange={(e) => set("deliveryNotes", e.target.value)}
                />
              </div>
            </section>

            {/* Terms */}
            <section className="rounded-2xl border bg-card p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => set("agreeTerms", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link
                    to="/terms-of-service"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                  . I understand that payment is due on delivery unless otherwise arranged.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-destructive mt-2">{errors.agreeTerms}</p>
              )}
            </section>

            {submitError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {submitError}
              </div>
            )}
          </div>

          {/* ── Right: order summary ────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h2 className="font-heading font-semibold text-lg text-foreground">
                Order Summary
              </h2>

              {/* Line items */}
              <div className="space-y-3">
                {lineItems.map((line) => (
                  <div key={line.equipment.id} className="flex gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {line.equipment.category === "Mobility Scooter"
                        ? "🛵"
                        : line.equipment.category === "Power Wheelchair"
                        ? "⚡"
                        : line.equipment.category === "Walking Aid"
                        ? "🦯"
                        : "♿"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {line.equipment.name}
                        {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(line.startDate, "dd MMM")} –{" "}
                        {format(line.endDate, "dd MMM yyyy")} · {line.days}d
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground shrink-0">
                      €{line.subtotal}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipment</span>
                  <span className="font-medium">€{equipmentTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">
                    {form.deliveryZoneId
                      ? deliveryFee === 0
                        ? "Free"
                        : `€${deliveryFee}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-foreground text-base">Total</span>
                  <span className="font-bold text-xl text-primary">€{total}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">Rental period: </span>
                  {format(rentalStart, "dd MMM yyyy")} →{" "}
                  {format(rentalEnd, "dd MMM yyyy")}
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-xl text-base font-bold"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                No payment now — we confirm within 2 hours
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
