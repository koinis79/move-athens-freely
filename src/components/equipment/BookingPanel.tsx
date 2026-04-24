import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { ArrowRight, CalendarIcon, Minus, Plus, ShieldCheck, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getPriceForDays, type EquipmentItem } from "@/data/equipment";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

interface DeliveryZone {
  id: string;
  name_en: string;
  slug: string;
  delivery_fee: number;
}

interface Props {
  item: EquipmentItem;
}

const TIER_LABELS = [
  { days: "1–3 days", tier: "priceTier1" as const },
  { days: "4–7 days", tier: "priceTier2" as const },
  { days: "8–14 days", tier: "priceTier3" as const },
  { days: "15–30 days", tier: "priceTier4" as const },
];

const BookingPanel = ({ item }: Props) => {
  const { addItem, items: cartItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [qty, setQty] = useState(1);
  const [zoneId, setZoneId] = useState<string>();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [added, setAdded] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [zoneError, setZoneError] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const zonePickerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = dateRange?.from;
  const endDate = dateRange?.to;

  // Fetch delivery zones from Supabase
  useEffect(() => {
    supabase
      .from("delivery_zones")
      .select("id, name_en, slug, delivery_fee")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setZones(data as DeliveryZone[]);
      });
  }, []);

  const numDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const d = differenceInDays(endDate, startDate);
    return d > 0 ? d : 0;
  }, [startDate, endDate]);

  const subtotal = useMemo(() => {
    if (numDays === 0) return 0;
    return getPriceForDays(item, numDays) * qty;
  }, [numDays, qty, item]);

  const selectedZone = zones.find((z) => z.id === zoneId);
  const deliveryFee = selectedZone?.delivery_fee ?? 0;
  const total = subtotal + deliveryFee;

  const dateRangeLabel = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM d")} – ${format(endDate, "MMM d")}`;
    }
    if (startDate) {
      return `${format(startDate, "MMM d")} – ...`;
    }
    return "Select dates";
  };

  const handleAddToCart = () => {
    if (!startDate || !endDate || numDays === 0) return;

    // Nudge user to select zone, but don't block
    if (!zoneId) {
      setZoneError(true);
      zonePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setZoneError(false), 3000);
      return;
    }

    addItem({
      equipment: item,
      startDate,
      endDate,
      quantity: qty,
      deliveryZone: selectedZone?.name_en,
      deliveryFee,
    });

    // GA4: add_to_cart
    trackEvent("add_to_cart", {
      currency: "EUR",
      value: subtotal,
      item_id: item.slug,
      item_name: item.name,
      item_category: item.category,
      quantity: qty,
      num_days: numDays,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast({
      title: "Added to cart!",
      description: `${item.name}${qty > 1 ? ` × ${qty}` : ""} added for ${numDays} day${numDays !== 1 ? "s" : ""}.`,
      action: (
        <Link
          to="/cart"
          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          View Cart
        </Link>
      ),
    });
  };



  // Navigate to checkout after cart is updated from Rent Now
  useEffect(() => {
    if (pendingCheckout && cartItems.length > 0) {
      setPendingCheckout(false);
      navigate("/checkout");
    }
  }, [pendingCheckout, cartItems.length, navigate]);

  const handleRentNow = () => {
    if (!startDate || !endDate || numDays === 0) {
      datePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!zoneId) {
      setZoneError(true);
      zonePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setZoneError(false), 3000);
      return;
    }

    addItem({
      equipment: item,
      startDate,
      endDate,
      quantity: qty,
      deliveryZone: selectedZone?.name_en,
      deliveryFee,
    });

    trackEvent("add_to_cart", {
      currency: "EUR",
      value: subtotal,
      item_id: item.slug,
      item_name: item.name,
      item_category: item.category,
      quantity: qty,
      num_days: numDays,
    });

    setPendingCheckout(true);
  };
  const handleMobileButton = () => {
    if (!startDate || !endDate) {
      datePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (!zoneId) {
      setZoneError(true);
      zonePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setZoneError(false), 3000);
    } else {
      handleAddToCart();
    }
  };

  const mobileButtonText = !startDate || !endDate
    ? "Select Dates"
    : !zoneId
      ? "Select Zone"
      : "Rent Now";

  return (
    <div className="space-y-6">
      {/* Tier pricing table */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="font-heading font-semibold text-foreground">Pricing</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-muted-foreground">from</span>
            <span className="text-2xl font-bold text-primary">€{item.priceTier1}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {TIER_LABELS.map(({ days, tier }, idx) => {
            const isPopular = tier === "priceTier2"; // 4-7 days — sweet spot
            const avgPerDay = item[tier] / [3, 7, 14, 30][idx];
            const tier1PerDay = item.priceTier1 / 3;
            const savingsPct = idx > 0 ? Math.round((1 - avgPerDay / tier1PerDay) * 100) : 0;
            return (
              <div
                key={tier}
                className={`relative rounded-lg border p-3 transition-colors ${
                  isPopular
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-card"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{days}</p>
                <p className={`mt-1 text-xl font-bold ${isPopular ? "text-primary" : "text-foreground"}`}>
                  €{item[tier]}
                </p>
                {savingsPct > 0 && (
                  <p className="mt-0.5 text-[10px] font-medium text-emerald-600">
                    Save {savingsPct}% per day
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground pt-1">
          Prices are per rental period, not per day. Longer stays = better value.
        </p>
      </div>

      {/* Booking form */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="font-heading font-semibold text-foreground">
          Book this equipment
        </h3>

        {/* Date range picker */}
        <div ref={datePickerRef} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Rental Dates
          </label>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {dateRangeLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (range?.from && range?.to) setCalOpen(false);
                }}
                disabled={(d) => d < today}
                numberOfMonths={1}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold text-foreground">
              {qty}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={qty >= 5}
              onClick={() => setQty((q) => Math.min(5, q + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Delivery zone */}
        <div ref={zonePickerRef} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Delivery Zone
          </label>
          <Select value={zoneId} onValueChange={(v) => { setZoneId(v); setZoneError(false); }}>
            <SelectTrigger className={cn("w-full", zoneError && "border-destructive ring-2 ring-destructive/20")}>
              <SelectValue placeholder="Select delivery zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => (
                <SelectItem key={z.id} value={z.id}>
                  {z.name_en}
                  {z.delivery_fee === 0 ? " — Free" : ` — €${z.delivery_fee}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {zoneError && (
            <p className="text-sm text-destructive mt-1.5">
              Please select where we should deliver
            </p>
          )}
        </div>

        {/* Price summary */}
        {numDays > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {numDays} day{numDays !== 1 ? "s" : ""}
                {qty > 1 && <span className="text-muted-foreground font-normal"> × {qty}</span>}
              </span>
              <div className="text-right">
                <span className="font-semibold text-foreground">€{subtotal}</span>
                <span className="ml-2 text-xs text-primary font-medium">
                  ({numDays <= 3 ? "1–3" : numDays <= 7 ? "4–7" : numDays <= 14 ? "8–14" : "15–30"} day rate)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Delivery fee</span>
              {zoneId ? (
                <span className="font-medium text-foreground">
                  {deliveryFee === 0 ? "Free" : `€${deliveryFee}`}
                </span>
              ) : (
                <span className="text-xs italic text-muted-foreground">Select delivery zone</span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-primary/20 pt-2.5">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">
                €{total}
                {!zoneId && <span className="text-sm font-normal text-muted-foreground"> + delivery</span>}
              </span>
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="w-full rounded-xl text-lg py-6 font-bold"
          disabled={!startDate || !endDate || numDays === 0}
          onClick={handleRentNow}
        >
          Rent Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="text-center text-xs text-muted-foreground -mt-2">
          Takes 2 minutes · No account needed
        </p>

        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-xl text-base"
          disabled={!startDate || !endDate || numDays === 0 || added}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {added ? "Added!" : "Add to Cart"}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Free cancellation up to 48 hours before delivery
        </p>
      </div>

      {/* Sticky Mobile Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-50 md:hidden">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="flex flex-col">
            {numDays > 0 && zoneId ? (
              <>
                <span className="text-xs text-muted-foreground">
                  {numDays} day{numDays !== 1 ? "s" : ""}{qty > 1 ? ` × ${qty}` : ""}
                </span>
                <span className="text-xl font-bold text-primary">€{total}</span>
              </>
            ) : numDays > 0 ? (
              <>
                <span className="text-xs text-muted-foreground">{numDays} day{numDays !== 1 ? "s" : ""}</span>
                <span className="text-xl font-bold text-primary">€{subtotal}</span>
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">From</span>
                <span className="text-xl font-bold text-primary">€{item.priceTier1}/day</span>
              </>
            )}
          </div>
          <Button
            size="lg"
            className="flex-1 max-w-[200px] rounded-xl text-base"
            onClick={() => {
              if (!startDate || !endDate) {
                datePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              } else if (!zoneId) {
                setZoneError(true);
                zonePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => setZoneError(false), 3000);
              } else {
                handleRentNow();
              }
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {mobileButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingPanel;
