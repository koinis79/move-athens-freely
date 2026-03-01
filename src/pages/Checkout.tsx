import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { differenceInDays, format } from "date-fns";
import { z } from "zod";
import { Lock, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const deliveryZones = [
  { label: "Athens City Center — Free delivery", fee: 0 },
  { label: "Greater Athens — €15 delivery", fee: 15 },
  { label: "Athens Airport — €25 delivery", fee: 25 },
  { label: "Piraeus Port — €20 delivery", fee: 20 },
];

const checkoutSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(5, "Phone number is required").max(20).regex(/^\+?\d[\d\s\-()]+$/, "Please enter a valid phone number"),
  hotelName: z.string().trim().min(1, "Hotel / accommodation name is required").max(200),
  address: z.string().trim().min(1, "Full address is required").max(500),
  deliveryZone: z.string().min(1, "Please select a delivery zone"),
  deliveryTime: z.enum(["morning", "afternoon", "evening"], { required_error: "Please select a delivery time" }),
  deliveryNotes: z.string().max(500).optional(),
  specialRequirements: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof checkoutSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const Checkout = () => {
  const { items } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<FormData>>({
    deliveryZone: items[0]?.deliveryZone || "",
    deliveryTime: "morning",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const set = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Price calculations
  const getSubtotal = (item: (typeof items)[0]) => {
    const days = differenceInDays(item.endDate, item.startDate);
    if (days <= 0) return 0;
    if (days >= 7) {
      const weeks = Math.ceil(days / 7);
      return weeks * item.equipment.pricePerWeek * item.quantity;
    }
    return days * item.equipment.pricePerDay * item.quantity;
  };

  const equipmentSubtotal = items.reduce((s, i) => s + getSubtotal(i), 0);
  const totalDeliveryFee = items.reduce((s, i) => s + i.deliveryFee, 0);
  const total = equipmentSubtotal + totalDeliveryFee;

  const handleSubmit = () => {
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof FormData;
        if (!fieldErrors[field]) fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    navigate("/booking/confirmation/MOV-20260401-001");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Nothing to check out</h2>
        <p className="text-muted-foreground mb-6">Add some equipment to your cart first.</p>
        <Button asChild><Link to="/equipment">Browse Equipment</Link></Button>
      </div>
    );
  }

  const FieldError = ({ field }: { field: keyof FormData }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-primary transition-colors">Cart</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Checkout</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left — Form */}
        <div className="space-y-8">
          {/* Section 1: Customer Information */}
          <section className="rounded-xl border bg-card p-6 space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Customer Information</h2>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Smith"
                  value={form.fullName || ""}
                  onChange={(e) => set("fullName", e.target.value)}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                <FieldError field="fullName" />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                <FieldError field="email" />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+30 69x xxx xxxx"
                  value={form.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                  className={errors.phone ? "border-destructive" : ""}
                />
                <FieldError field="phone" />
              </div>
            </div>
          </section>

          {/* Section 2: Delivery Details */}
          <section className="rounded-xl border bg-card p-6 space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Delivery Details</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="hotelName">Hotel / Accommodation Name *</Label>
                <Input
                  id="hotelName"
                  placeholder="e.g. Hotel Grande Bretagne"
                  value={form.hotelName || ""}
                  onChange={(e) => set("hotelName", e.target.value)}
                  className={errors.hotelName ? "border-destructive" : ""}
                />
                <FieldError field="hotelName" />
              </div>

              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  placeholder="Street, area, postal code"
                  value={form.address || ""}
                  onChange={(e) => set("address", e.target.value)}
                  className={errors.address ? "border-destructive" : ""}
                />
                <FieldError field="address" />
              </div>

              <div>
                <Label>Delivery Zone *</Label>
                <Select value={form.deliveryZone || ""} onValueChange={(v) => set("deliveryZone", v)}>
                  <SelectTrigger className={errors.deliveryZone ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select delivery zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryZones.map((z) => (
                      <SelectItem key={z.label} value={z.label}>{z.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="deliveryZone" />
              </div>

              <div>
                <Label>Preferred Delivery Time *</Label>
                <RadioGroup
                  value={form.deliveryTime || ""}
                  onValueChange={(v) => set("deliveryTime", v)}
                  className="flex flex-col sm:flex-row gap-3 mt-2"
                >
                  {[
                    { value: "morning", label: "Morning (9am–12pm)" },
                    { value: "afternoon", label: "Afternoon (12pm–5pm)" },
                    { value: "evening", label: "Evening (5pm–8pm)" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer hover:border-primary transition-colors has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
                    >
                      <RadioGroupItem value={opt.value} />
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
                <FieldError field="deliveryTime" />
              </div>

              <div>
                <Label htmlFor="deliveryNotes">Delivery Notes (optional)</Label>
                <Textarea
                  id="deliveryNotes"
                  placeholder="Room number, reception instructions..."
                  value={form.deliveryNotes || ""}
                  onChange={(e) => set("deliveryNotes", e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Special Requirements */}
          <section className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="font-heading text-xl font-bold text-foreground">Special Requirements</h2>
            <Textarea
              placeholder="Tell us about any specific needs (e.g., extra cushion, extended footrest, right-hand joystick for power wheelchair)"
              value={form.specialRequirements || ""}
              onChange={(e) => set("specialRequirements", e.target.value)}
              className="resize-none"
              rows={3}
            />
          </section>
        </div>

        {/* Right — Order Summary */}
        <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] h-fit">
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Order Summary</h2>

            {/* Item list */}
            <div className="space-y-4">
              {items.map((item) => {
                const days = differenceInDays(item.endDate, item.startDate);
                const sub = getSubtotal(item);
                return (
                  <div key={item.equipment.id} className="flex gap-3">
                    <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
                      <img src="/placeholder.svg" alt={item.equipment.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.equipment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(item.startDate, "MMM d")} – {format(item.endDate, "MMM d, yyyy")} · Qty {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">€{sub.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">€{equipmentSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="text-foreground font-medium">
                  {totalDeliveryFee === 0 ? "Free" : `€${totalDeliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-heading font-bold text-foreground text-base">Total</span>
                <span className="text-2xl font-bold text-primary">€{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox
                checked={agreedToTerms}
                onCheckedChange={(v) => setAgreedToTerms(v === true)}
                className="mt-0.5"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">Cancellation Policy</Link>
              </span>
            </label>

            <Button
              size="lg"
              className="w-full rounded-xl text-base"
              disabled={!agreedToTerms}
              onClick={handleSubmit}
            >
              Pay €{total.toFixed(2)}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You will be redirected to Stripe for secure payment
            </p>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              256-bit SSL encrypted
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              {["Visa", "Mastercard", "Amex", "Apple Pay"].map((name) => (
                <span key={name} className="text-[10px] font-semibold text-muted-foreground border rounded px-2 py-0.5">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
