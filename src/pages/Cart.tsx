import { Link } from "react-router-dom";
import { differenceInDays, format } from "date-fns";
import { ShoppingCart, Trash2, Minus, Plus, Lock, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <ShoppingCart className="h-16 w-16 text-muted-foreground/40 mb-6" />
    <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
      Your cart is empty
    </h2>
    <p className="text-muted-foreground mb-8 max-w-md">
      Browse our equipment to find what you need for your Athens trip
    </p>
    <Button asChild size="lg" className="rounded-xl">
      <Link to="/equipment">Browse Equipment</Link>
    </Button>
  </div>
);

const Cart = () => {
  const { items, removeItem, updateItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyCart />
      </div>
    );
  }

  const getSubtotal = (item: (typeof items)[0]) => {
    const days = differenceInDays(item.endDate, item.startDate);
    if (days <= 0) return 0;
    if (days >= 7) {
      const weeks = Math.ceil(days / 7);
      return weeks * item.equipment.pricePerWeek * item.quantity;
    }
    return days * item.equipment.pricePerDay * item.quantity;
  };

  const getRateLabel = (item: (typeof items)[0]) => {
    const days = differenceInDays(item.endDate, item.startDate);
    if (days >= 7) {
      const weeks = Math.ceil(days / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} × €${item.equipment.pricePerWeek}`;
    }
    return `${days} day${days > 1 ? "s" : ""} × €${item.equipment.pricePerDay}`;
  };

  const equipmentSubtotal = items.reduce((sum, i) => sum + getSubtotal(i), 0);
  const totalDeliveryFee = items.reduce((sum, i) => sum + i.deliveryFee, 0);
  const total = equipmentSubtotal + totalDeliveryFee;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Cart</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-8">
        Shopping Cart ({items.length})
      </h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left — Cart items */}
        <div className="space-y-4">
          {items.map((item) => {
            const days = differenceInDays(item.endDate, item.startDate);
            const subtotal = getSubtotal(item);

            return (
              <div
                key={item.equipment.id}
                className="rounded-xl border bg-card p-5 space-y-4"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src="/placeholder.svg"
                      alt={item.equipment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/equipment/${item.equipment.categorySlug}/${item.equipment.slug}`}
                          className="font-heading font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {item.equipment.name}
                        </Link>
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.equipment.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
                        onClick={() => removeItem(item.equipment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Dates */}
                    <p className="text-sm text-muted-foreground mt-2">
                      {format(item.startDate, "MMM d")} –{" "}
                      {format(item.endDate, "MMM d, yyyy")} ({days} day
                      {days !== 1 ? "s" : ""})
                    </p>

                    {/* Quantity + Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateItem(item.equipment.id, {
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.quantity >= 5}
                          onClick={() =>
                            updateItem(item.equipment.id, {
                              quantity: Math.min(5, item.quantity + 1),
                            })
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {getRateLabel(item)}
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </p>
                        <p className="font-bold text-foreground">€{subtotal}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery zone */}
                <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Delivery Zone
                    </label>
                    <Select
                      value={item.deliveryZone || ""}
                      onValueChange={(val) => {
                        const zone = deliveryZones.find((z) => z.label === val);
                        updateItem(item.equipment.id, {
                          deliveryZone: val,
                          deliveryFee: zone?.fee ?? 0,
                        });
                      }}
                    >
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
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Delivery Notes
                    </label>
                    <Textarea
                      placeholder="Room number, special instructions..."
                      className="min-h-[40px] h-10 resize-none text-sm"
                      value={item.deliveryNotes || ""}
                      onChange={(e) =>
                        updateItem(item.equipment.id, {
                          deliveryNotes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Order Summary */}
        <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] h-fit">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="font-heading text-xl font-bold text-foreground">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment subtotal</span>
                <span className="text-foreground font-medium">
                  €{equipmentSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="text-foreground font-medium">
                  {totalDeliveryFee === 0
                    ? "Free"
                    : `€${totalDeliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit</span>
                <span className="text-foreground font-medium">€0.00</span>
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-heading font-bold text-foreground text-base">
                  Total
                </span>
                <span className="text-2xl font-bold text-primary">
                  €{total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button asChild size="lg" className="w-full rounded-xl text-base">
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Secure payment via Stripe
            </p>

            {/* Payment icons */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {["Visa", "Mastercard", "Amex", "Apple Pay"].map((name) => (
                <span
                  key={name}
                  className="text-[10px] font-semibold text-muted-foreground border rounded px-2 py-0.5"
                >
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

export default Cart;
