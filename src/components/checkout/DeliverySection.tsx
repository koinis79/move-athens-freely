import { useState, useCallback } from "react";
import {
  Truck,
  Store,
  MapPin,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  // Simplified — single address field
  deliveryAddress: string;
  // Cruise extras
  shipName: string;
  // Airport extras
  flightNumber: string;
  // Pickup
  pickupLocation: PickupLocation | null;
  // Auto-detected zone (slug)
  detectedZone: string | null;
  // Manual override zone (slug)
  manualZone: string | null;
  // Common
  timeSlot: string;
  whatsappUpdates: boolean;
  specialInstructions: string;
  // Legacy — kept for compat but unused in new flow
  hotelName: string;
  neighborhood: string;
  roomNumber: string;
  portArrival: Date | undefined;
  portDeparture: Date | undefined;
  arrivalDateTime: Date | undefined;
  preferredDate: Date | undefined;
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

/* ── Zone detection ────────────────────────────────────────────────────── */

interface ZoneInfo {
  slug: string;
  label: string;
  fee: number;
}

const ZONES: ZoneInfo[] = [
  { slug: "store-pickup", label: "Store Pickup", fee: 0 },
  { slug: "athens-city", label: "Athens City", fee: 10 },
  { slug: "athens-airport", label: "Athens Airport", fee: 50 },
  { slug: "piraeus-port", label: "Piraeus Cruise Terminal", fee: 25 },
];

function detectZoneFromAddress(address: string): string {
  const l = address.toLowerCase();

  // Airport
  if (l.includes("airport") || l.includes("venizelos") || l.includes("eleftherios") || l.includes("aerodrom") || l.includes("αεροδρόμ")) return "athens-airport";

  // Piraeus / Cruise / Port
  if (l.includes("piraeus") || l.includes("πειραι") || l.includes("cruise") || l.includes("ferry") || l.includes("port") || l.includes("λιμάνι")) return "piraeus-port";

  // Default — all Athens addresses
  if (l.length > 3) return "athens-city";
  return "athens-city";
}

function getZone(slug: string | null): ZoneInfo | undefined {
  return ZONES.find(z => z.slug === slug);
}

/* ── Exported helpers (used by Checkout.tsx) ────────────────────────────── */

export function getDeliveryFee(data: DeliveryFormData): number {
  if (data.method === "pickup") return 0;
  const slug = data.manualZone || data.detectedZone;
  return getZone(slug)?.fee ?? 0;
}

export function getDeliveryAddress(data: DeliveryFormData): string {
  if (data.method === "pickup") {
    const locs: Record<string, string> = {
      stadiou: "Store Pickup: Stadiou 31, Athens",
      davaki: "Store Pickup: Davaki 16, Kallithea",
      kolokotroni: "Store Pickup: Kolokotroni 22, Chalandri",
    };
    return locs[data.pickupLocation ?? ""] ?? "Store Pickup";
  }
  return data.deliveryAddress.trim();
}

export function getDeliveryZoneSlug(data: DeliveryFormData): string | null {
  if (data.method === "pickup") return "store-pickup";
  return data.manualZone || data.detectedZone || null;
}

export function validateDelivery(data: DeliveryFormData): DeliveryErrors {
  const errs: DeliveryErrors = {};
  if (!data.method) {
    errs.method = "Please select delivery or pickup";
    return errs;
  }
  if (data.method === "delivery") {
    if (!data.deliveryAddress.trim()) errs.deliveryAddress = "Please enter your delivery address";
    if (data.subType === "cruise" && !data.shipName.trim()) errs.shipName = "Please enter your ship name";
  }
  if (data.method === "pickup" && !data.pickupLocation) {
    errs.pickupLocation = "Please select a pickup location";
  }
  return errs;
}

/* ── Pickup locations ──────────────────────────────────────────────────── */

const PICKUP_LOCATIONS = [
  { id: "stadiou" as const, name: "Stadiou 31, Athens", sub: "City Center — Near Syntagma" },
  { id: "davaki" as const, name: "Davaki 16, Kallithea", sub: "South Athens" },
  { id: "kolokotroni" as const, name: "Kolokotroni 22, Chalandri", sub: "North Athens" },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export function DeliverySection({ data, errors, onChange, clearError }: Props) {
  const [showZoneOverride, setShowZoneOverride] = useState(false);

  const set = useCallback(
    <K extends keyof DeliveryFormData>(field: K, value: DeliveryFormData[K]) => {
      onChange({ [field]: value });
      clearError(field);
    },
    [onChange, clearError],
  );

  const activeZoneSlug = data.manualZone || data.detectedZone;
  const activeZone = getZone(activeZoneSlug);
  const fee = getDeliveryFee(data);

  const handleAddressChange = (address: string) => {
    set("deliveryAddress", address);
    if (address.trim().length > 3) {
      const detected = detectZoneFromAddress(address);
      onChange({ detectedZone: detected });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-foreground">
        How should we get the equipment to you?
      </h2>

      {/* Method toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
            data.method === "delivery"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40",
          )}
          onClick={() => set("method", "delivery")}
        >
          <Truck className="h-5 w-5" />
          Deliver to me
        </button>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
            data.method === "pickup"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40",
          )}
          onClick={() => set("method", "pickup")}
        >
          <Store className="h-5 w-5" />
          Store pickup (free)
        </button>
      </div>
      {errors.method && <p className="text-sm text-destructive">{errors.method}</p>}

      {/* ── Delivery flow ── */}
      {data.method === "delivery" && (
        <div className="space-y-4 rounded-xl border bg-card p-5">
          {/* Delivery address — single field */}
          <div className="space-y-1.5">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea
              id="deliveryAddress"
              placeholder="Hotel name and address (e.g. Hotel Grande Bretagne, Syntagma Square, Athens)"
              value={data.deliveryAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={cn("min-h-[80px]", errors.deliveryAddress && "border-destructive")}
            />
            {errors.deliveryAddress && <p className="text-sm text-destructive">{errors.deliveryAddress}</p>}
          </div>

          {/* Auto-detected zone badge */}
          {activeZone && data.deliveryAddress.trim().length > 3 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {activeZone.label}
                {" — "}
                <span className="text-primary font-bold">
                  {activeZone.fee === 0 ? "Free delivery" : `€${activeZone.fee} delivery`}
                </span>
              </span>
              <button
                type="button"
                className="ml-auto text-xs text-muted-foreground hover:text-primary underline"
                onClick={() => setShowZoneOverride(!showZoneOverride)}
              >
                {showZoneOverride ? "Close" : "Change zone"}
              </button>
            </div>
          )}

          {/* Manual zone override */}
          {showZoneOverride && (
            <div className="space-y-1.5">
              <Label>Override delivery zone</Label>
              <Select
                value={data.manualZone ?? ""}
                onValueChange={(v) => {
                  onChange({ manualZone: v || null });
                  setShowZoneOverride(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone manually" />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.filter(z => z.slug !== "store-pickup").map((z) => (
                    <SelectItem key={z.slug} value={z.slug}>
                      {z.label} — {z.fee === 0 ? "Free" : `€${z.fee}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cruise ship name (optional extra) */}
          {data.deliveryAddress.toLowerCase().includes("cruise") || data.deliveryAddress.toLowerCase().includes("piraeus") || data.deliveryAddress.toLowerCase().includes("port") ? (
            <div className="space-y-1.5">
              <Label htmlFor="shipName">Ship / Vessel Name (if applicable)</Label>
              <Input
                id="shipName"
                placeholder="e.g. MSC Musica"
                value={data.shipName}
                onChange={(e) => set("shipName", e.target.value)}
              />
            </div>
          ) : null}

          {/* Flight number (optional extra for airport) */}
          {data.deliveryAddress.toLowerCase().includes("airport") ? (
            <div className="space-y-1.5">
              <Label htmlFor="flightNumber">Flight Number (optional)</Label>
              <Input
                id="flightNumber"
                placeholder="e.g. BA264"
                value={data.flightNumber}
                onChange={(e) => set("flightNumber", e.target.value)}
              />
            </div>
          ) : null}

          {/* Delivery timing note */}
          <p className="text-sm text-muted-foreground">
            We'll contact you to arrange the best delivery time.
          </p>
        </div>
      )}

      {/* ── Pickup flow ── */}
      {data.method === "pickup" && (
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <Label>Select store</Label>
          {PICKUP_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-all",
                data.pickupLocation === loc.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
              onClick={() => set("pickupLocation", loc.id)}
            >
              <Store className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">{loc.name}</p>
                <p className="text-xs text-muted-foreground">{loc.sub}</p>
              </div>
            </button>
          ))}
          {errors.pickupLocation && <p className="text-sm text-destructive">{errors.pickupLocation}</p>}
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2.5">
            <MapPin className="h-4 w-4 text-green-600 shrink-0" />
            <span className="text-sm font-medium text-green-700">Free pickup — no delivery fee</span>
          </div>
        </div>
      )}

      {/* ── Special instructions + WhatsApp ── */}
      {data.method && (
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="space-y-1.5">
            <Label htmlFor="specialInstructions">Special Instructions (optional)</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Room number, accessibility needs, gate code..."
              value={data.specialInstructions}
              onChange={(e) => set("specialInstructions", e.target.value)}
              className="min-h-[60px]"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp Updates</p>
                <p className="text-xs text-muted-foreground">Get delivery notifications via WhatsApp</p>
              </div>
            </div>
            <Switch
              checked={data.whatsappUpdates}
              onCheckedChange={(v) => set("whatsappUpdates", v)}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {data.method && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Delivery fee</span>
            <span className="font-bold text-primary">
              {fee === 0 ? "Free" : `€${fee}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliverySection;
