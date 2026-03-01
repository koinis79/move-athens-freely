import { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, Minus, Plus, ShieldCheck } from "lucide-react";
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
import type { EquipmentItem } from "@/data/equipment";
import type { EquipmentDetails } from "@/data/equipmentSpecs";

const deliveryZones = [
  { label: "Athens City Center — Free delivery", fee: 0 },
  { label: "Greater Athens — €15 delivery", fee: 15 },
  { label: "Athens Airport — €25 delivery", fee: 25 },
  { label: "Piraeus Port — €20 delivery", fee: 20 },
];

interface Props {
  item: EquipmentItem;
  details: EquipmentDetails;
}

const BookingPanel = ({ item, details }: Props) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [qty, setQty] = useState(1);
  const [zone, setZone] = useState<string>();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const numDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const d = differenceInDays(endDate, startDate);
    return d > 0 ? d : 0;
  }, [startDate, endDate]);

  const { rateLabel, unitPrice, subtotal } = useMemo(() => {
    if (numDays === 0)
      return { rateLabel: "", unitPrice: 0, subtotal: 0 };

    if (numDays >= 30 && details.pricePerMonth > 0) {
      const months = Math.ceil(numDays / 30);
      return {
        rateLabel: `${months} month${months > 1 ? "s" : ""} × €${details.pricePerMonth}`,
        unitPrice: details.pricePerMonth,
        subtotal: months * details.pricePerMonth * qty,
      };
    }
    if (numDays >= 7) {
      const weeks = Math.ceil(numDays / 7);
      return {
        rateLabel: `${weeks} week${weeks > 1 ? "s" : ""} × €${item.pricePerWeek}`,
        unitPrice: item.pricePerWeek,
        subtotal: weeks * item.pricePerWeek * qty,
      };
    }
    return {
      rateLabel: `${numDays} day${numDays > 1 ? "s" : ""} × €${item.pricePerDay}`,
      unitPrice: item.pricePerDay,
      subtotal: numDays * item.pricePerDay * qty,
    };
  }, [numDays, qty, item, details]);

  const deliveryFee = zone
    ? deliveryZones.find((z) => z.label === zone)?.fee ?? 0
    : 0;

  const total = subtotal + deliveryFee;

  // Savings calculations
  const dailyTotal7 = 7 * item.pricePerDay;
  const weeklySaving = Math.round(
    ((dailyTotal7 - item.pricePerWeek) / dailyTotal7) * 100
  );
  const dailyTotal30 = 30 * item.pricePerDay;
  const monthlySaving =
    details.pricePerMonth > 0
      ? Math.round(
          ((dailyTotal30 - details.pricePerMonth) / dailyTotal30) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Pricing table */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="font-heading font-semibold text-foreground">Pricing</h3>
        <div className="divide-y">
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Daily</span>
            <span className="font-semibold text-foreground">
              €{item.pricePerDay}/day
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Weekly</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                €{item.pricePerWeek}/week
              </span>
              {weeklySaving > 0 && (
                <span className="text-xs font-medium text-accent">
                  Save {weeklySaving}%
                </span>
              )}
            </div>
          </div>
          {details.pricePerMonth > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Monthly</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  €{details.pricePerMonth}/month
                </span>
                {monthlySaving > 0 && (
                  <span className="text-xs font-medium text-accent">
                    Save {monthlySaving}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
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
                  disabled={(d) =>
                    d < (startDate ?? today)
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
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
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Delivery Zone
          </label>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select delivery zone" />
            </SelectTrigger>
            <SelectContent>
              {deliveryZones.map((z) => (
                <SelectItem key={z.label} value={z.label}>
                  {z.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price calculation */}
        {numDays > 0 && (
          <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {rateLabel}
                {qty > 1 ? ` × ${qty}` : ""}
              </span>
              <span className="text-foreground">€{subtotal}</span>
            </div>
            {zone && (
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

        <Button size="lg" className="w-full rounded-xl text-base">
          Add to Cart
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Free cancellation up to 48 hours before delivery
        </p>
      </div>
    </div>
  );
};

export default BookingPanel;
