"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole, CartItem, MenuItem, Alert } from "@/lib/types";
import { alerts as initialAlerts } from "@/lib/data/alerts";
import type { Lang } from "@/lib/i18n";

// ===== CUSTOMER ORDER =====
export interface CustomerOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  customerName?: string | null;
  orderType?: string;
  deliveryAddress?: string | null;
  deliveryPhone?: string | null;
  status: string;
  totalAmount: number;
  estimatedTime: number;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
}

// ===== APP STORE =====
interface AppStore {
  role: UserRole;
  setRole: (role: UserRole) => void;

  language: Lang;
  setLanguage: (lang: Lang) => void;

  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartItemCount: () => number;

  customerOrders: CustomerOrder[];
  addCustomerOrder: (order: CustomerOrder) => void;
  updateCustomerOrderStatus: (orderId: string, status: string) => void;

  tableNumber: number | null;
  setTableNumber: (num: number | null) => void;

  notificationCount: number;
  clearNotifications: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      role: "customer",
      setRole: (role) => set({ role }),

      language: "vi",
      setLanguage: (lang) => set({ language: lang }),

      cart: [],
      addToCart: (item, quantity = 1, notes) => {
        const cart = get().cart;
        const existing = cart.find((c) => c.menuItem.id === item.id);
        if (existing) {
          set({ cart: cart.map((c) => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + quantity } : c) });
        } else {
          set({ cart: [...cart, { menuItem: item, quantity, notes }] });
        }
      },
      removeFromCart: (itemId) => set({ cart: get().cart.filter((c) => c.menuItem.id !== itemId) }),
      updateCartQuantity: (itemId, quantity) => {
        if (quantity <= 0) { get().removeFromCart(itemId); return; }
        set({ cart: get().cart.map((c) => c.menuItem.id === itemId ? { ...c, quantity } : c) });
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
      cartItemCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      customerOrders: [],
      addCustomerOrder: (order) => set({ customerOrders: [order, ...get().customerOrders] }),
      updateCustomerOrderStatus: (orderId, status) =>
        set({ customerOrders: get().customerOrders.map((o) => o.id === orderId ? { ...o, status } : o) }),

      tableNumber: null,
      setTableNumber: (num) => set({ tableNumber: num }),

      notificationCount: 0,
      clearNotifications: () => set({ notificationCount: 0 }),
    }),
    {
      name: "kfc-sync-app",
      partialize: (state) => ({
        role: state.role,
        language: state.language,
        tableNumber: state.tableNumber,
        customerOrders: state.customerOrders,
      }),
    }
  )
);

// ===== MANAGER STORE =====
export interface ShiftEmployee {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  isActive: boolean;
}

export type ShiftKey = "morning" | "afternoon" | "evening";

interface ManagerStore {
  alerts: Alert[];
  resolveAlert: (alertId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branchId: string) => void;
  dateRange: "today" | "week" | "month";
  setDateRange: (range: "today" | "week" | "month") => void;

  shiftAssignments: Record<ShiftKey, ShiftEmployee[]>;
  addToShift: (shift: ShiftKey, emp: ShiftEmployee) => void;
  removeFromShift: (shift: ShiftKey, empId: string) => void;
}

export const useManagerStore = create<ManagerStore>()(
  persist(
    (set, get) => ({
      alerts: initialAlerts,
      resolveAlert: (alertId) => {
        set({ alerts: get().alerts.map((a) => a.id === alertId ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a) });
      },
      activeTab: "overview",
      setActiveTab: (tab) => set({ activeTab: tab }),
      selectedBranch: "b001",
      setSelectedBranch: (branchId) => set({ selectedBranch: branchId }),
      dateRange: "today",
      setDateRange: (range) => set({ dateRange: range }),

      shiftAssignments: { morning: [], afternoon: [], evening: [] },
      addToShift: (shift, emp) => {
        const current = get().shiftAssignments;
        const already = current[shift].some((e) => e.id === emp.id);
        if (already) return;
        set({ shiftAssignments: { ...current, [shift]: [...current[shift], emp] } });
      },
      removeFromShift: (shift, empId) => {
        const current = get().shiftAssignments;
        set({ shiftAssignments: { ...current, [shift]: current[shift].filter((e) => e.id !== empId) } });
      },
    }),
    {
      name: "kfc-sync-manager",
      partialize: (state) => ({ shiftAssignments: state.shiftAssignments }),
    }
  )
);
