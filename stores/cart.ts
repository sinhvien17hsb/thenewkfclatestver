"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  imageEmoji: string;
  quantity: number;
  notes?: string;
}

interface CartStore {
  tableNumber: string;
  items: CartItem[];
  setTableNumber: (t: string) => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQty: (menuItemId: string, qty: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      tableNumber: "",
      items: [],
      setTableNumber: (t) => set({ tableNumber: t }),
      addItem: (item, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.menuItemId === item.menuItemId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: qty }] });
        }
      },
      removeItem: (menuItemId) =>
        set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) }),
      updateQty: (menuItemId, qty) => {
        if (qty <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity: qty } : i
          ),
        });
      },
      updateNotes: (menuItemId, notes) =>
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, notes } : i
          ),
        }),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "kfc-cart" }
  )
);
