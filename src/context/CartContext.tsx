import { createContext, useContext, useState, ReactNode } from "react";
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

// Mock item so the cart isn't empty on first visit
const mockStartDate = new Date(2026, 3, 1); // Apr 1 2026
const mockEndDate = new Date(2026, 3, 8);   // Apr 8 2026

const defaultItems: CartItem[] = [
  {
    equipment: {
      id: "1",
      slug: "lightweight-folding-wheelchair",
      name: "Lightweight Folding Wheelchair",
      category: "Wheelchair",
      categorySlug: "wheelchairs",
      description: "Ultra-light aluminium frame, folds compactly for travel and storage.",
      pricePerDay: 10,
      pricePerWeek: 60,
      availability: "Available",
      popular: true,
      image: "",
    },
    startDate: mockStartDate,
    endDate: mockEndDate,
    quantity: 1,
    deliveryZone: "Athens City Center — Free delivery",
    deliveryFee: 0,
  },
];

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(defaultItems);

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
