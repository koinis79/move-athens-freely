import { useState } from "react";
import { format } from "date-fns";
import {
  Truck,
  Store,
  Hotel,
  Ship,
  Plane,
  MapPin,
  CalendarIcon,
  Clock,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

/* ── Types ──────────────────────────────────────────────────────────────── */

export type DeliveryMethod = "delivery" | "pickup";
export type DeliverySubType = "hotel" | "cruise" | "airport";
export type PickupLocation = "stadiou" | "davaki" | "kolokotroni";

export interface DeliveryFormData {
  method: DeliveryMethod | null;
  subType: DeliverySubType | null;
  // Hotel fields
  hotelName: string;
  neighborhood: string;
  roomNumber: string;
  // Cruise fields
  shipName: string;
  portArrival: Date | undefined;
  portDeparture: Date | undefined;
  // Airport fields
  flightNumber: string;
  arrivalDateTime: Date | undefined;
  // Pickup
  pickupLocation: PickupLocation | null;
  // Common
  preferredDate: Date | undefined;
  timeSlot: string;
  whatsappUpdates: boolean;
  specialInstructions: string;
}

export interface DeliveryErrors {
  [key: string]: string;
}

interface Props {
  data: DeliveryFormData;
  errors: DeliveryErrors;
  onChange: (updates: Partial<DeliveryFormData>) => void;
  clearError: (field: string) => void;
}

/* ── Fee logic ──────────────────────────────────────────────────────────── */

const NEIGHBORHOOD_OPTIONS = [
  {
    value: "center",
    label: "City Center (Syntagma, Plaka, Monastiraki, Acropolis area)",
    fee: 10,
  },
  {
    value: "inner",
    label: "Kolonaki, Pagkrati, Kallithea, Neos Kosmos",
    fee: 15,
  },
  {
    value: "suburbs",
    label: "Glyfada, Vouliagmeni, Kifisia, Suburbs",
    fee: 20,
  },
  { value: "other", label: "Other area (we'll confirm)", fee: 20 },
];

const PICKUP_LOCATIONS = [
  {
    id: "stadiou" as const,
    name: "Stadiou 31, Athens",
    sub: "City Center — Near Syntagma",
  },
  {
    id: "davaki" as const,
    name: "Davaki 16, Kallithea",
    sub: "South Athens",
  },
  {
    id: "kolokotroni" as const,
    name: "Kolokotroni 22, Chalandri",
    sub: "North Athens",
  },
];

const TIME_SLOTS = [
  { value: "morning", label: "Morning", sub: "08:00 – 12:00" },
  { value: "afternoon", label: "Afternoon", sub: "12:00 – 16:00" },
  { value: "evening", label: "Evening", sub: "16:00 – 20:00" },
];

export function getDeliveryFee(data: DeliveryFormData): number {
  if (data.method === "pickup") return 0;
  if (data.method === "delivery") {
    if (data.subType === "cruise") return 25;
    if (data.subType === "airport") return 30;
    if (data.subType === "hotel") {
      const n = NEIGHBORHOOD_OPTIONS.find((o) => o.value === data.neighborhood);
      return n?.fee ?? 0;
    }
  }
  return 0;
}

export function getDeliveryAddress(data: DeliveryFormData): string {
  if (data.method === "pickup") {
    const loc = PICKUP_LOCATIONS.find((l) => l.id === data.pickupLocation);
    return `Store Pickup: ${loc?.name ?? ""}`;
  }
  if (data.subType === "hotel") return `${data.hotelName}${data.roomNumber ? `, Room ${data.roomNumber}` : ""}`;
  if (data.subType === "cruise") return `Piraeus Port — ${data.shipName}`;
  if (data.subType === "airport") return `Athens Airport (ATH)${data.flightNumber ? ` — Flight ${data.flightNumber}` : ""}`;
  return "";
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const today = new Date();
today.setHours(0, 0, 0, 0);

function OptionCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 p-4 text-left transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-muted-foreground/40 hover:shadow-sm",
        className
      )}
    >
      {children}
    </button>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

function DateTimeField({
  label,
  date,
  onDateChange,
  timeSlot,
  onTimeChange,
  required,
  errorDate,
  errorTime,
}: {
  label: string;
  date: Date | undefined;
  onDateChange: (d: Date | undefined) => void;
  timeSlot: string;
  onTimeChange: (v: string) => void;
  required?: boolean;
  errorDate?: string;
  errorTime?: string;
}) {
  return (
    <div className="space-y-3">
      <Label>
        {label} {required && "*"}
      </Label>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  errorDate && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd MMM yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateChange}
                disabled={(d) => d < today}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FieldError msg={errorDate} />
        </div>
        <div>
          <Select value={timeSlot} onValueChange={onTimeChange}>
            <SelectTrigger className={errorTime ? "border-destructive" : ""}>
              <SelectValue placeholder="Time slot" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <span className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {s.label} ({s.sub})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError msg={errorTime} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */

const DeliverySection = ({ data, errors, onChange, clearError }: Props) => {
  const set = <K extends keyof DeliveryFormData>(
    field: K,
    value: DeliveryFormData[K]
  ) => {
    onChange({ [field]: value });
    clearError(field);
  };

  const fee = getDeliveryFee(data);

  return (
    <section className="rounded-2xl border bg-card p-6 space-y-6">
      <h2 className="font-heading font-semibold text-lg text-foreground">
        Delivery Details
      </h2>

      {/* ─── STEP 1: Main choice ─────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-3">
        <OptionCard
          selected={data.method === "delivery"}
          onClick={() =>
            onChange({ method: "delivery", subType: null, pickupLocation: null })
          }
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground">Deliver to Me</span>
          </div>
          <p className="text-sm text-muted-foreground">
            From <span className="font-semibold text-foreground">€10</span> ·
            We bring it to you
          </p>
        </OptionCard>

        <OptionCard
          selected={data.method === "pickup"}
          onClick={() =>
            onChange({ method: "pickup", subType: null, neighborhood: "" })
          }
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-accent/10 p-2">
              <Store className="h-5 w-5 text-accent" />
            </div>
            <span className="font-bold text-foreground">Store Pickup</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-2 py-0.5 text-xs font-bold">
              FREE
            </span>{" "}
            · Save on delivery
          </p>
        </OptionCard>
      </div>
      <FieldError msg={errors.method} />

      {/* ─── STEP 2A: Delivery sub-options ───────────────────────────── */}
      {data.method === "delivery" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <Label className="text-base font-semibold">
            Where are you staying?
          </Label>

          <div className="grid gap-3 sm:grid-cols-3">
            <OptionCard
              selected={data.subType === "hotel"}
              onClick={() => set("subType", "hotel")}
            >
              <Hotel className="h-5 w-5 text-primary mb-1.5" />
              <p className="font-semibold text-sm text-foreground">
                Hotel / Airbnb
              </p>
              <p className="text-xs text-muted-foreground">in Athens</p>
            </OptionCard>

            <OptionCard
              selected={data.subType === "cruise"}
              onClick={() => set("subType", "cruise")}
            >
              <Ship className="h-5 w-5 text-primary mb-1.5" />
              <p className="font-semibold text-sm text-foreground">
                Cruise Ship
              </p>
              <p className="text-xs text-muted-foreground">Piraeus Port · €25</p>
            </OptionCard>

            <OptionCard
              selected={data.subType === "airport"}
              onClick={() => set("subType", "airport")}
            >
              <Plane className="h-5 w-5 text-primary mb-1.5" />
              <p className="font-semibold text-sm text-foreground">
                Athens Airport
              </p>
              <p className="text-xs text-muted-foreground">ATH · €30</p>
            </OptionCard>
          </div>
          <FieldError msg={errors.subType} />

          {/* ── Hotel sub-form ──────────────────────────────────────────── */}
          {data.subType === "hotel" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <Label htmlFor="hotelName">Hotel / Accommodation Name *</Label>
                <Input
                  id="hotelName"
                  placeholder="e.g., Hotel Grande Bretagne, Athens Marriott"
                  value={data.hotelName}
                  onChange={(e) => set("hotelName", e.target.value)}
                  className={errors.hotelName ? "border-destructive" : ""}
                />
                <FieldError msg={errors.hotelName} />
              </div>

              <div className="space-y-1.5">
                <Label>Area / Neighborhood *</Label>
                <Select
                  value={data.neighborhood}
                  onValueChange={(v) => {
                    set("neighborhood", v);
                  }}
                >
                  <SelectTrigger
                    className={errors.neighborhood ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select your area" />
                  </SelectTrigger>
                  <SelectContent>
                    {NEIGHBORHOOD_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label} — €{o.fee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError msg={errors.neighborhood} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roomNumber">Room Number (optional)</Label>
                <Input
                  id="roomNumber"
                  placeholder="e.g., 412"
                  value={data.roomNumber}
                  onChange={(e) => set("roomNumber", e.target.value)}
                  className="max-w-[160px]"
                />
              </div>

              <DateTimeField
                label="Preferred Delivery Time"
                date={data.preferredDate}
                onDateChange={(d) => set("preferredDate", d)}
                timeSlot={data.timeSlot}
                onTimeChange={(v) => set("timeSlot", v)}
                required
                errorDate={errors.preferredDate}
                errorTime={errors.timeSlot}
              />

              {data.neighborhood && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Delivery fee:{" "}
                    <span className="font-bold text-primary">€{fee}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Cruise sub-form ─────────────────────────────────────────── */}
          {data.subType === "cruise" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <Label htmlFor="shipName">Ship Name *</Label>
                <Input
                  id="shipName"
                  placeholder="e.g., Celebrity Apex"
                  value={data.shipName}
                  onChange={(e) => set("shipName", e.target.value)}
                  className={errors.shipName ? "border-destructive" : ""}
                />
                <FieldError msg={errors.shipName} />
              </div>

              <DateTimeField
                label="Port Arrival"
                date={data.portArrival}
                onDateChange={(d) => set("portArrival", d)}
                timeSlot={data.timeSlot}
                onTimeChange={(v) => set("timeSlot", v)}
                required
                errorDate={errors.portArrival}
              />

              <DateTimeField
                label="Port Departure"
                date={data.portDeparture}
                onDateChange={(d) => set("portDeparture", d)}
                timeSlot={data.timeSlot}
                onTimeChange={(v) => set("timeSlot", v)}
                required
                errorDate={errors.portDeparture}
              />

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm space-y-1">
                <p className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary shrink-0" />
                  Delivery fee:{" "}
                  <span className="font-bold text-primary">€25</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  We'll meet you at Piraeus port terminal
                </p>
              </div>
            </div>
          )}

          {/* ── Airport sub-form ────────────────────────────────────────── */}
          {data.subType === "airport" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <Label htmlFor="flightNumber">Flight Number (optional)</Label>
                <Input
                  id="flightNumber"
                  placeholder="e.g., BA123"
                  value={data.flightNumber}
                  onChange={(e) => set("flightNumber", e.target.value)}
                  className="max-w-[200px]"
                />
              </div>

              <DateTimeField
                label="Arrival Date & Time"
                date={data.arrivalDateTime}
                onDateChange={(d) => set("arrivalDateTime", d)}
                timeSlot={data.timeSlot}
                onTimeChange={(v) => set("timeSlot", v)}
                required
                errorDate={errors.arrivalDateTime}
              />

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm space-y-1">
                <p className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-primary shrink-0" />
                  Delivery fee:{" "}
                  <span className="font-bold text-primary">€30</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  We'll meet you at the arrivals hall
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 2B: Store pickup ───────────────────────────────────── */}
      {data.method === "pickup" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <Label className="text-base font-semibold">
            Choose your pickup location
          </Label>

          <div className="space-y-3">
            {PICKUP_LOCATIONS.map((loc) => (
              <OptionCard
                key={loc.id}
                selected={data.pickupLocation === loc.id}
                onClick={() => set("pickupLocation", loc.id)}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {loc.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{loc.sub}</p>
                  </div>
                </div>
              </OptionCard>
            ))}
          </div>
          <FieldError msg={errors.pickupLocation} />

          {data.pickupLocation && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <DateTimeField
                label="Preferred Pickup Date & Time"
                date={data.preferredDate}
                onDateChange={(d) => set("preferredDate", d)}
                timeSlot={data.timeSlot}
                onTimeChange={(v) => set("timeSlot", v)}
                required
                errorDate={errors.preferredDate}
                errorTime={errors.timeSlot}
              />

              <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 text-sm space-y-1">
                <p className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-accent shrink-0" />
                  Delivery fee:{" "}
                  <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-2 py-0.5 text-xs font-bold">
                    FREE
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Equipment will be ready for you. Please bring ID.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Common fields ───────────────────────────────────────────── */}
      {data.method && (
        <div className="space-y-4 border-t pt-5 animate-in fade-in duration-300">
          {/* WhatsApp toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <MessageCircle className="h-4 w-4 text-[hsl(142_70%_45%)]" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  WhatsApp Updates
                </p>
                <p className="text-xs text-muted-foreground">
                  Send me delivery updates via WhatsApp
                </p>
              </div>
            </div>
            <Switch
              checked={data.whatsappUpdates}
              onCheckedChange={(v) => set("whatsappUpdates", v)}
            />
          </div>

          {/* Special instructions */}
          <div className="space-y-1.5">
            <Label htmlFor="specialInstructions">
              Special Instructions (optional)
            </Label>
            <Textarea
              id="specialInstructions"
              rows={3}
              placeholder="Accessibility needs, timing preferences, or other requests..."
              value={data.specialInstructions}
              onChange={(e) => set("specialInstructions", e.target.value)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default DeliverySection;
