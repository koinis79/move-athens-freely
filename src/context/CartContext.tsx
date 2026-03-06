import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { EquipmentItem } from "@/data/equipment";

export interface CartItem {
  equipment: EquipmentItem;
  startDate: Date;
  endDate: Date;
  quantity: number;
  deliveryZone?: string;
  deliveryFee: number;
  deliveryNotes?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (equipmentId: string) => void;
  updateItem: (equipmentId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "moveability_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((i: any) => ({
      ...i,
      startDate: new Date(i.startDate),
      endDate: new Date(i.endDate),
    }));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(
        items.map((i) => ({
          ...i,
          startDate: i.startDate.toISOString(),
          endDate: i.endDate.toISOString(),
        }))
      )
    );
  } catch {}
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.equipment.id === item.equipment.id);
      if (existing) {
        return prev.map((i) =>
          i.equipment.id === item.equipment.id ? { ...i, ...item } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (equipmentId: string) => {
    setItems((prev) => prev.filter((i) => i.equipment.id !== equipmentId));
  };

  const updateItem = (equipmentId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((i) =>
        i.equipment.id === equipmentId ? { ...i, ...updates } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateItem, clearCart, itemCount: items.length }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
