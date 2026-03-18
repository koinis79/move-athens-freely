import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getPriceForDays } from "@/data/equipment";
import DeliverySection, {
  getDeliveryFee,
  getDeliveryAddress,
  type DeliveryFormData,
  type DeliveryErrors,
} from "@/components/checkout/DeliverySection";

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  agreeTerms: boolean;
}

interface CustomerErrors {
  [key: string]: string;
}

const INITIAL_DELIVERY: DeliveryFormData = {
  method: null,
  subType: null,
  hotelName: "",
  neighborhood: "",
  roomNumber: "",
  shipName: "",
  portArrival: undefined,
  portDeparture: undefined,
  flightNumber: "",
  arrivalDateTime: undefined,
  pickupLocation: null,
  preferredDate: undefined,
  timeSlot: "morning",
  whatsappUpdates: true,
  specialInstructions: "",
};

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Customer info
  const [customer, setCustomer] = useState<CustomerForm>({
    name: "",
    email: "",
    phone: "",
    agreeTerms: false,
  });
  const [customerErrors, setCustomerErrors] = useState<CustomerErrors>({});

  // Delivery
  const [delivery, setDelivery] = useState<DeliveryFormData>(INITIAL_DELIVERY);
  const [deliveryErrors, setDeliveryErrors] = useState<DeliveryErrors>({});

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
          setCustomer((f) => ({
            ...f,
            name: data.full_name ?? f.name,
            email: data.email ?? user.email ?? f.email,
            phone: data.phone ?? f.phone,
          }));
        }
      });
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !submitting) navigate("/equipment");
  }, [items, navigate, submitting]);

  // ── Pricing ──────────────────────────────────────────────────────────────
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
  const deliveryFee = getDeliveryFee(delivery);
  const total = equipmentTotal + deliveryFee;

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
  const setC = (field: keyof CustomerForm, value: string | boolean) => {
    setCustomer((f) => ({ ...f, [field]: value }));
    setCustomerErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const handleDeliveryChange = (updates: Partial<DeliveryFormData>) => {
    setDelivery((d) => ({ ...d, ...updates }));
  };

  const clearDeliveryError = (field: string) => {
    setDeliveryErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const cErr: CustomerErrors = {};
    if (!customer.name.trim()) cErr.name = "Full name is required";
    if (!customer.email.trim() || !/\S+@\S+\.\S+/.test(customer.email))
      cErr.email = "Valid email is required";
    if (!customer.phone.trim()) cErr.phone = "Phone number is required";
    if (!customer.agreeTerms) cErr.agreeTerms = "You must agree to the terms";

    const dErr: DeliveryErrors = {};
    if (!delivery.method) dErr.method = "Please select a delivery method";

    if (delivery.method === "delivery") {
      if (!delivery.subType) dErr.subType = "Please select where you're staying";
      if (delivery.subType === "hotel") {
        if (!delivery.hotelName.trim()) dErr.hotelName = "Hotel name is required";
        if (!delivery.neighborhood) dErr.neighborhood = "Please select an area";
        if (!delivery.preferredDate) dErr.preferredDate = "Please select a date";
      }
      if (delivery.subType === "cruise") {
        if (!delivery.shipName.trim()) dErr.shipName = "Ship name is required";
        if (!delivery.portArrival) dErr.portArrival = "Arrival date is required";
        if (!delivery.portDeparture) dErr.portDeparture = "Departure date is required";
      }
      if (delivery.subType === "airport") {
        if (!delivery.arrivalDateTime) dErr.arrivalDateTime = "Arrival date is required";
      }
    }

    if (delivery.method === "pickup") {
      if (!delivery.pickupLocation) dErr.pickupLocation = "Please select a pickup location";
      if (delivery.pickupLocation && !delivery.preferredDate)
        dErr.preferredDate = "Please select a pickup date";
    }

    setCustomerErrors(cErr);
    setDeliveryErrors(dErr);
    return Object.keys(cErr).length === 0 && Object.keys(dErr).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const itemsPayload = lineItems.map((line) => ({
        equipment_id: line.equipment.id,
        quantity: line.quantity,
        price_per_day: line.equipment.priceTier1,
        num_days: line.days,
        subtotal: line.subtotal,
      }));

      const availabilityPayload: {
        equipment_id: string;
        date: string;
        quantity_booked: number;
      }[] = [];
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

      const deliveryAddress = getDeliveryAddress(delivery);
      const deliveryNotes = [
        delivery.specialInstructions.trim(),
        delivery.whatsappUpdates ? "WhatsApp updates: YES" : "",
        delivery.method === "pickup"
          ? `Pickup: ${delivery.pickupLocation}`
          : "",
        delivery.subType === "cruise"
          ? `Ship: ${delivery.shipName}`
          : "",
        delivery.subType === "airport" && delivery.flightNumber
          ? `Flight: ${delivery.flightNumber}`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const { data, error: rpcErr } = await supabase.rpc("create_booking", {
        p_booking_number: "",
        p_user_id: user?.id ?? null,
        p_customer_name: customer.name.trim(),
        p_customer_email: customer.email.trim(),
        p_customer_phone: customer.phone.trim(),
        p_delivery_zone_id: null,
        p_delivery_address: deliveryAddress,
        p_delivery_time_slot: delivery.timeSlot,
        p_delivery_notes: deliveryNotes || null,
        p_rental_start: format(rentalStart, "yyyy-MM-dd"),
        p_rental_end: format(rentalEnd, "yyyy-MM-dd"),
        p_num_days: Math.max(1, differenceInDays(rentalEnd, rentalStart)),
        p_subtotal: equipmentTotal,
        p_delivery_fee: deliveryFee,
        p_total_amount: total,
        p_items: itemsPayload,
        p_availability: availabilityPayload,
      });

      if (rpcErr || !data || (Array.isArray(data) && data.length === 0)) {
        throw new Error(
          rpcErr?.message ?? "Failed to create booking — no data returned"
        );
      }

      const row = Array.isArray(data) ? data[0] : data;
      const bookingNumber = row?.booking_number;

      if (!bookingNumber) {
        throw new Error(
          `Booking created but no booking_number returned. Raw: ${JSON.stringify(data)}`
        );
      }

      const {
        data: { session: supabaseSession },
      } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL ?? "https://lmgpuqgwkiapgpdsxvmb.supabase.co"}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey:
              import.meta.env.VITE_SUPABASE_ANON_KEY ??
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ3B1cWd3a2lhcGdwZHN4dm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjc1NzksImV4cCI6MjA4Nzk0MzU3OX0.WTs1-rimMSZtPoedl7qgxiWXGOJm8-yMaUEKfU7XuCI",
            ...(supabaseSession?.access_token
              ? { Authorization: `Bearer ${supabaseSession.access_token}` }
              : {}),
          },
          body: JSON.stringify({ booking_number: bookingNumber }),
        }
      );

      const result = await res.json();
      if (!res.ok || !result.url) {
        throw new Error(
          result.error ?? `Edge function failed (HTTP ${res.status})`
        );
      }

      window.location.href = result.url;
    } catch (err: any) {
      const msg = err?.message ?? "Something went wrong. Please try again.";
      console.error("[Checkout] Error:", msg, err);
      setSubmitError(msg);
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container py-10 md:py-16">
      <nav className="mb-6 text-sm text-muted-foreground flex items-center gap-1.5">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <Link to="/cart" className="hover:text-primary transition-colors">
          Cart
        </Link>
        <span>&gt;</span>
        <span className="text-foreground font-medium">Checkout</span>
      </nav>

      <h1 className="text-3xl font-heading font-bold text-foreground mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ── Left: form ──────────────────────────────────────────── */}
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
                    value={customer.name}
                    onChange={(e) => setC("name", e.target.value)}
                    className={customerErrors.name ? "border-destructive" : ""}
                  />
                  {customerErrors.name && (
                    <p className="text-xs text-destructive">
                      {customerErrors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={customer.email}
                    onChange={(e) => setC("email", e.target.value)}
                    className={customerErrors.email ? "border-destructive" : ""}
                  />
                  {customerErrors.email && (
                    <p className="text-xs text-destructive">
                      {customerErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={customer.phone}
                    onChange={(e) => setC("phone", e.target.value)}
                    className={customerErrors.phone ? "border-destructive" : ""}
                  />
                  {customerErrors.phone && (
                    <p className="text-xs text-destructive">
                      {customerErrors.phone}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Delivery section */}
            <DeliverySection
              data={delivery}
              errors={deliveryErrors}
              onChange={handleDeliveryChange}
              clearError={clearDeliveryError}
            />

            {/* Terms */}
            <section className="rounded-2xl border bg-card p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customer.agreeTerms}
                  onChange={(e) => setC("agreeTerms", e.target.checked)}
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
                  . I understand that payment is due on delivery unless otherwise
                  arranged.
                </span>
              </label>
              {customerErrors.agreeTerms && (
                <p className="text-xs text-destructive mt-2">
                  {customerErrors.agreeTerms}
                </p>
              )}
            </section>

            {submitError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {submitError}
              </div>
            )}
          </div>

          {/* ── Right: order summary ────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h2 className="font-heading font-semibold text-lg text-foreground">
                Order Summary
              </h2>

              <div className="space-y-3">
                {lineItems.map((line) => (
                  <div key={line.equipment.id} className="flex gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {line.equipment.category === "Mobility Scooter"
                        ? "🛵"
                        : line.equipment.category === "Power Wheelchair"
                          ? "⚡"
                          : line.equipment.category === "Rollator"
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

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipment</span>
                  <span className="font-medium">€{equipmentTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">
                    {delivery.method
                      ? deliveryFee === 0
                        ? (
                          <span className="text-accent font-bold">Free</span>
                        )
                        : `€${deliveryFee}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-foreground text-base">
                    Total
                  </span>
                  <span className="font-bold text-xl text-primary">
                    €{total}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">
                    Rental period:{" "}
                  </span>
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
