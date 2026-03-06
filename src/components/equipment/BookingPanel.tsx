import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, Minus, Plus, ShieldCheck, ShoppingCart } from "lucide-react";
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
  const { addItem } = useCart();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [qty, setQty] = useState(1);
  const [zoneId, setZoneId] = useState<string>();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [added, setAdded] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  // Savings % vs buying all days at tier1 rate
  const savingsLabel = (tierPrice: number, tier: keyof EquipmentItem) => {
    const base = item.priceTier1;
    if (tier === "priceTier1" || tierPrice <= base) return null;
    const saving = Math.round(((base - tierPrice / 7) / base) * 100);
    return saving > 0 ? `Save ~${saving}%` : null;
  };

  const handleAddToCart = () => {
    if (!startDate || !endDate || numDays === 0) return;
    addItem({
      equipment: item,
      startDate,
      endDate,
      quantity: qty,
      deliveryZone: selectedZone?.name_en,
      deliveryFee,
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

  return (
    <div className="space-y-6">
      {/* Tier pricing table */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="font-heading font-semibold text-foreground">Pricing</h3>
        <div className="divide-y text-sm">
          {TIER_LABELS.map(({ days, tier }) => (
            <div key={tier} className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">{days}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  €{item[tier]}
                </span>
                {tier !== "priceTier1" && (
                  <span className="text-xs font-medium text-accent">
                    {(() => {
                      const pct = Math.round(
                        ((item.priceTier1 - item[tier] / [3, 7, 14, 30][[
                          "priceTier1","priceTier2","priceTier3","priceTier4"
                        ].indexOf(tier)]) / item.priceTier1) * 100
                      );
                      return pct > 0 ? `~${pct}% cheaper/day` : "";
                    })()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Prices are per rental period, not per day.
        </p>
      </div>

      {/* Booking form */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="font-heading font-semibold text-foreground">
          Book this equipment
        </h3>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd MMM yyyy") : "Select"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(d) => d < today}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd MMM yyyy") : "Select"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(d) => d < (startDate ?? today)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active tier indicator */}
        {numDays > 0 && (
          <p className="text-xs text-primary font-medium">
            {numDays} day{numDays !== 1 ? "s" : ""} selected →{" "}
            {numDays <= 3
              ? "1–3 day rate"
              : numDays <= 7
              ? "4–7 day rate"
              : numDays <= 14
              ? "8–14 day rate"
              : "15–30 day rate"}{" "}
            applies
          </p>
        )}

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
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Delivery Zone
          </label>
          <Select value={zoneId} onValueChange={setZoneId}>
            <SelectTrigger className="w-full">
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
        </div>

        {/* Price breakdown */}
        {numDays > 0 && (
          <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Equipment{qty > 1 ? ` × ${qty}` : ""}
              </span>
              <span className="text-foreground">€{subtotal}</span>
            </div>
            {zoneId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="text-foreground">
                  {deliveryFee === 0 ? "Free" : `€${deliveryFee}`}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">€{total}</span>
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="w-full rounded-xl text-base"
          disabled={!startDate || !endDate || numDays === 0 || added}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {added ? "Added to Cart!" : "Add to Cart"}
        </Button>

        {added && (
          <div className="flex justify-center">
            <Link
              to="/cart"
              className="text-sm text-primary font-medium underline underline-offset-2"
            >
              View cart &amp; checkout →
            </Link>
          </div>
        )}

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Free cancellation up to 48 hours before delivery
        </p>
      </div>
    </div>
  );
};

export default BookingPanel;
