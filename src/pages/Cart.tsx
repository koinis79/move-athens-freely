import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { getPriceForDays } from "@/data/equipment";

const Cart = () => {
  const { items, removeItem, updateItem, itemCount } = useCart();
  const navigate = useNavigate();

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

  // ── Empty state ───────────────────────────────────────────────────────────
  if (itemCount === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground mb-8">
          Browse our equipment to find what you need for your Athens trip.
        </p>
        <Button asChild size="lg" className="rounded-xl">
          <Link to="/equipment">Browse Equipment</Link>
        </Button>
      </div>
    );
  }

  // ── Cart with items ───────────────────────────────────────────────────────
  return (
    <div className="container py-10 md:py-16">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 text-sm text-muted-foreground flex items-center gap-1.5">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-foreground font-medium">Cart</span>
        </nav>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Your Cart
          <span className="ml-3 text-lg font-normal text-muted-foreground">
            ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </span>
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── Left: item list ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {lineItems.map((line) => {
            const tierLabel =
              line.days <= 3
                ? "1–3 day rate"
                : line.days <= 7
                ? "4–7 day rate"
                : line.days <= 14
                ? "8–14 day rate"
                : "15–30 day rate";

            return (
              <div
                key={line.equipment.id}
                className="rounded-2xl border bg-card p-5 flex flex-col sm:flex-row gap-5"
              >
                {/* Product image */}
                {line.equipment.image ? (
                  <img
                    src={line.equipment.image}
                    alt={line.equipment.name}
                    className="h-28 w-28 shrink-0 rounded-xl object-contain bg-gray-100 dark:bg-gray-800 p-2 self-start"
                  />
                ) : (
                  <div className="h-28 w-28 shrink-0 rounded-xl bg-muted flex items-center justify-center self-start">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <Badge variant="secondary" className="text-xs mb-1.5">
                        {line.equipment.category}
                      </Badge>
                      <h3 className="font-semibold text-foreground leading-tight">
                        <Link
                          to={`/equipment/${line.equipment.categorySlug}/${line.equipment.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {line.equipment.name}
                        </Link>
                      </h3>
                    </div>
                    <button
                      onClick={() => removeItem(line.equipment.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Dates */}
                  <p className="text-sm text-muted-foreground mb-3">
                    {format(line.startDate, "dd MMM yyyy")} →{" "}
                    {format(line.endDate, "dd MMM yyyy")}
                    <span className="ml-2 text-primary font-medium">
                      ({line.days} day{line.days !== 1 ? "s" : ""} · {tierLabel})
                    </span>
                  </p>

                  {/* Quantity + subtotal */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={line.quantity <= 1}
                        onClick={() =>
                          updateItem(line.equipment.id, {
                            quantity: Math.max(1, line.quantity - 1),
                          })
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center font-semibold text-sm">
                        {line.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={line.quantity >= 5}
                        onClick={() =>
                          updateItem(line.equipment.id, {
                            quantity: Math.min(5, line.quantity + 1),
                          })
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="font-bold text-lg text-foreground">
                      €{line.subtotal}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right: order summary ────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="font-heading font-bold text-lg text-foreground">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">
              {lineItems.map((line) => (
                <div key={line.equipment.id} className="flex justify-between">
                  <span className="text-muted-foreground truncate max-w-[200px]">
                    {line.equipment.name}
                    {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                  </span>
                  <span className="text-foreground font-medium shrink-0">
                    €{line.subtotal}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment subtotal</span>
                <span className="font-semibold text-foreground">€{equipmentTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold text-foreground">Total (excl. delivery)</span>
              <span className="text-xl font-bold text-primary">€{equipmentTotal}</span>
            </div>

            <Button
              size="lg"
              className="w-full rounded-xl text-base"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Free cancellation up to 48h before delivery
            </p>

            <div className="pt-2 border-t">
              <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
                <Link to="/equipment">
                  ← Continue browsing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
