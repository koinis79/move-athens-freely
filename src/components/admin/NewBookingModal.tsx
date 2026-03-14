import { useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import {
  Search, User, UserPlus, Check, ChevronRight, ChevronLeft,
  Package, CalendarIcon, CreditCard, Minus, Plus, X,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { customers, getCustomerStats, getFlag, type Customer } from "@/data/adminCustomersMockData";
import { inventoryItems, type InventoryItem } from "@/data/adminInventoryMockData";
import { toast } from "@/hooks/use-toast";

const DELIVERY_FEE = 15;

const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+49", label: "DE +49" },
  { code: "+33", label: "FR +33" },
  { code: "+39", label: "IT +39" },
  { code: "+34", label: "ES +34" },
  { code: "+81", label: "JP +81" },
  { code: "+86", label: "CN +86" },
  { code: "+61", label: "AU +61" },
  { code: "+353", label: "IE +353" },
  { code: "+46", label: "SE +46" },
  { code: "+48", label: "PL +48" },
  { code: "+45", label: "DK +45" },
  { code: "+30", label: "GR +30" },
];

const NATIONALITIES = [
  "American", "Australian", "British", "Chinese", "Danish", "Dutch",
  "French", "German", "Greek", "Irish", "Italian", "Japanese",
  "Polish", "Spanish", "Swedish", "Other",
];

const TIME_SLOTS = [
  { value: "morning", label: "Morning (08:00 – 12:00)" },
  { value: "afternoon", label: "Afternoon (12:00 – 17:00)" },
  { value: "evening", label: "Evening (17:00 – 21:00)" },
];

const CATEGORIES = ["All", "Wheelchairs", "Scooters", "Rollators", "Accessories"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate?: Date;
}

const NewBookingModal = ({ open, onOpenChange, defaultDate }: Props) => {
  const [step, setStep] = useState(1);

  // Step 1 — Customer
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "", lastName: "", email: "", countryCode: "+44", phone: "", nationality: "British",
  });

  // Step 2 — Equipment
  const [equipCategory, setEquipCategory] = useState("All");
  const [equipSearch, setEquipSearch] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Step 3 — Rental
  const tomorrow = useMemo(() => addDays(new Date(), 1), []);
  const [startDate, setStartDate] = useState<Date>(defaultDate ?? tomorrow);
  const [endDate, setEndDate] = useState<Date>(addDays(defaultDate ?? tomorrow, 3));
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("morning");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Step 4 — Summary
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [internalNotes, setInternalNotes] = useState("");

  // Computed
  const duration = useMemo(() => {
    const ms = endDate.getTime() - startDate.getTime();
    return Math.max(1, Math.round(ms / 86400000));
  }, [startDate, endDate]);

  const subtotal = selectedEquipment ? selectedEquipment.dailyRate * duration * quantity : 0;
  const total = subtotal + DELIVERY_FEE;

  // Search results
  const customerResults = useMemo(() => {
    if (!customerSearch || customerSearch.length < 2) return [];
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    ).slice(0, 5);
  }, [customerSearch]);

  const availableEquipment = useMemo(() => {
    let list = inventoryItems.filter((i) => i.status === "available");
    if (equipCategory !== "All") list = list.filter((i) => i.category === equipCategory);
    if (equipSearch) {
      const q = equipSearch.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [equipCategory, equipSearch]);

  // Validation
  const step1Valid = isNewCustomer
    ? !!(newCustomer.firstName && newCustomer.lastName && newCustomer.email)
    : !!selectedCustomer;
  const step2Valid = !!selectedEquipment;
  const step3Valid = !!deliveryAddress && startDate < endDate;

  const canProceed = (s: number) => {
    if (s === 1) return step1Valid;
    if (s === 2) return step2Valid;
    if (s === 3) return step3Valid;
    return true;
  };

  const reset = () => {
    setStep(1);
    setIsNewCustomer(false);
    setCustomerSearch("");
    setSelectedCustomer(null);
    setNewCustomer({ firstName: "", lastName: "", email: "", countryCode: "+44", phone: "", nationality: "British" });
    setEquipCategory("All");
    setEquipSearch("");
    setSelectedEquipment(null);
    setQuantity(1);
    setStartDate(defaultDate ?? tomorrow);
    setEndDate(addDays(defaultDate ?? tomorrow, 3));
    setDeliveryAddress("");
    setDeliveryTime("morning");
    setSpecialInstructions("");
    setPaymentMethod("cash");
    setInternalNotes("");
  };

  const handleCreate = () => {
    toast({
      title: "Booking Created",
      description: `New booking for ${isNewCustomer ? `${newCustomer.firstName} ${newCustomer.lastName}` : selectedCustomer?.name} has been created.`,
    });
    reset();
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const customerName = isNewCustomer
    ? `${newCustomer.firstName} ${newCustomer.lastName}`.trim()
    : selectedCustomer?.name ?? "";

  // ─── Steps ──────────────────────────────────────────────
  const STEPS = [
    { num: 1, label: "Customer", icon: User },
    { num: 2, label: "Equipment", icon: Package },
    { num: 3, label: "Details", icon: CalendarIcon },
    { num: 4, label: "Confirm", icon: CreditCard },
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
                  <div className={cn("h-px w-12 sm:w-20 mx-1 mt-[-14px]", step > s.num ? "bg-primary" : "bg-border")} />
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
              {/* Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={!isNewCustomer ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => { setIsNewCustomer(false); setSelectedCustomer(null); }}
                >
                  <Search className="h-3 w-3 mr-1" /> Existing Customer
                </Button>
                <Button
                  variant={isNewCustomer ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => { setIsNewCustomer(true); setSelectedCustomer(null); setCustomerSearch(""); }}
                >
                  <UserPlus className="h-3 w-3 mr-1" /> New Customer
                </Button>
              </div>

              {!isNewCustomer ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email or phone…"
                      value={customerSearch}
                      onChange={(e) => { setCustomerSearch(e.target.value); setSelectedCustomer(null); }}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>

                  {/* Search results */}
                  {customerResults.length > 0 && !selectedCustomer && (
                    <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                      {customerResults.map((c) => {
                        const st = getCustomerStats(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); }}
                            className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <span className="text-sm font-medium text-foreground">{getFlag(c.countryCode)} {c.name}</span>
                              <span className="block text-xs text-muted-foreground">{c.email} · {c.phone}</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] h-5">{st.totalBookings} bookings</Badge>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected */}
                  {selectedCustomer && (
                    <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {getFlag(selectedCustomer.countryCode)} {selectedCustomer.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {getCustomerStats(selectedCustomer.id).totalBookings} bookings
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">First Name *</Label>
                    <Input className="h-9 text-sm" value={newCustomer.firstName} onChange={(e) => setNewCustomer((p) => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name *</Label>
                    <Input className="h-9 text-sm" value={newCustomer.lastName} onChange={(e) => setNewCustomer((p) => ({ ...p, lastName: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Email *</Label>
                    <Input type="email" className="h-9 text-sm" value={newCustomer.email} onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Phone</Label>
                    <div className="flex gap-2">
                      <Select value={newCustomer.countryCode} onValueChange={(v) => setNewCustomer((p) => ({ ...p, countryCode: v }))}>
                        <SelectTrigger className="w-[100px] h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_CODES.map((cc) => (
                            <SelectItem key={cc.code} value={cc.code} className="text-xs">{cc.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input className="h-9 text-sm flex-1" value={newCustomer.phone} onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Nationality</Label>
                    <Select value={newCustomer.nationality} onValueChange={(v) => setNewCustomer((p) => ({ ...p, nationality: v }))}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NATIONALITIES.map((n) => (
                          <SelectItem key={n} value={n} className="text-xs">{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 2: Equipment ─── */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment…"
                    value={equipSearch}
                    onChange={(e) => setEquipSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <Select value={equipCategory} onValueChange={setEquipCategory}>
                  <SelectTrigger className="w-[140px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
                {availableEquipment.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEquipment(item)}
                    className={cn(
                      "text-left border rounded-lg p-3 transition-all hover:border-primary/40",
                      selectedEquipment?.id === item.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border",
                    )}
                  >
                    <div className="w-full h-14 bg-muted rounded-md flex items-center justify-center mb-2">
                      <Package className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-[9px] h-4 px-1">{item.category}</Badge>
                      <span className="text-xs font-semibold text-foreground">€{item.dailyRate}/day</span>
                    </div>
                  </button>
                ))}
                {availableEquipment.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                    No available equipment matches your filters.
                  </div>
                )}
              </div>

              {selectedEquipment && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedEquipment.name}</p>
                      <p className="text-xs text-muted-foreground">€{selectedEquipment.dailyRate}/day</p>
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
                </>
              )}
            </div>
          )}

          {/* ─── Step 3: Rental Details ─── */}
          {step === 3 && (
            <div className="space-y-4">
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
                <span className="text-xs text-muted-foreground ml-1">rental period</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Delivery Address *</Label>
                <Input
                  placeholder="Hotel name and full address…"
                  className="h-9 text-sm"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>

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

              <div className="space-y-1.5">
                <Label className="text-xs">Special Instructions</Label>
                <Textarea
                  placeholder="Ground floor, no steps, leave with reception…"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="text-sm min-h-[60px]"
                />
              </div>
            </div>
          )}

          {/* ─── Step 4: Summary ─── */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Order summary */}
              <div className="bg-muted/40 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order Summary</h4>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium text-foreground">{customerName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Equipment</span>
                  <span className="font-medium text-foreground">
                    {selectedEquipment?.name}{quantity > 1 ? ` ×${quantity}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rental Period</span>
                  <span className="font-medium text-foreground">
                    {format(startDate, "dd MMM")} – {format(endDate, "dd MMM yyyy")} ({duration}d)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-foreground truncate max-w-[200px]">{deliveryAddress}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    €{selectedEquipment?.dailyRate} × {duration} days{quantity > 1 ? ` × ${quantity}` : ""}
                  </span>
                  <span className="text-foreground">€{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-foreground">€{DELIVERY_FEE}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">€{total}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <Label className="text-xs">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-1.5">
                  {[
                    { value: "cash", label: "Cash on Delivery" },
                    { value: "card", label: "Card on Delivery" },
                    { value: "online", label: "Online Payment" },
                  ].map((pm) => (
                    <label
                      key={pm.value}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors",
                        paymentMethod === pm.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/30",
                      )}
                    >
                      <RadioGroupItem value={pm.value} />
                      <span className="text-sm text-foreground">{pm.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Internal notes */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Internal Notes (admin only)</Label>
                <Textarea
                  placeholder="Notes visible only to the team…"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="text-sm min-h-[50px]"
                />
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
            onClick={() => (step === 1 ? handleClose(false) : setStep((s) => s - 1))}
          >
            {step === 1 ? (
              "Cancel"
            ) : (
              <><ChevronLeft className="h-3 w-3 mr-1" /> Back</>
            )}
          </Button>

          {step < 4 ? (
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
              onClick={handleCreate}
            >
              Create Booking
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewBookingModal;
