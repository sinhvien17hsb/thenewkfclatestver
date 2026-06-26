"use client";
import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole, CartItem, MenuItem, Alert, AuthUser, AuthRole } from "@/lib/types";
import { ROLE_PERMISSIONS, AUTH_ROLE_AVATARS } from "@/lib/types";
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

// ===== AUTH STORE =====
const MOCK_ACCOUNTS: AuthUser[] = [
  {
    id: "mock_kitchen01",
    name: "Trần Văn Bếp",
    employeeId: "kitchen01",
    email: "kitchen01@kfc.vn",
    password: "123456",
    role: "kitchen",
    branchId: "b001",
    branchName: "KFC Vincom Bà Triệu",
    registeredAt: "2024-01-15T08:00:00.000Z",
    avatar: AUTH_ROLE_AVATARS["kitchen"],
  },
  {
    id: "mock_supervisor01",
    name: "Nguyễn Thị Hương",
    employeeId: "supervisor01",
    email: "supervisor01@kfc.vn",
    password: "123456",
    role: "supervisor",
    branchId: "b001",
    branchName: "KFC Vincom Bà Triệu",
    registeredAt: "2024-01-10T08:00:00.000Z",
    avatar: AUTH_ROLE_AVATARS["supervisor"],
  },
  {
    id: "mock_manager01",
    name: "Lê Minh Tuấn",
    employeeId: "manager01",
    email: "manager01@kfc.vn",
    password: "123456",
    role: "manager",
    branchId: "b001",
    branchName: "KFC Vincom Bà Triệu",
    registeredAt: "2024-01-01T08:00:00.000Z",
    avatar: AUTH_ROLE_AVATARS["manager"],
  },
];

function checkAccess(role: AuthRole, path: string): boolean {
  const allowed = ROLE_PERMISSIONS[role] ?? [];
  return allowed.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}

interface AuthStore {
  user: AuthUser | null;
  users: AuthUser[];
  login: (idOrEmail: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (data: Omit<AuthUser, "id" | "registeredAt">) => { success: boolean; error?: string };
  canAccess: (path: string) => boolean;
  updateProfile: (data: Partial<Pick<AuthUser, "name" | "email">>) => void;
  changePassword: (oldPw: string, newPw: string) => { success: boolean; error?: string };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      users: MOCK_ACCOUNTS,
      login: (idOrEmail, password) => {
        const found = get().users.find(
          (u) => (u.employeeId === idOrEmail || u.email === idOrEmail) && u.password === password
        );
        if (!found) return { success: false, error: "Mã nhân viên/email hoặc mật khẩu không đúng." };
        set({ user: found });
        return { success: true };
      },
      logout: () => set({ user: null }),
      register: (data) => {
        const exists = get().users.find((u) => u.employeeId === data.employeeId || u.email === data.email);
        if (exists) return { success: false, error: "Mã nhân viên hoặc email đã tồn tại." };
        const newUser: AuthUser = { ...data, id: `user_${Date.now()}`, registeredAt: new Date().toISOString() };
        set({ users: [...get().users, newUser], user: newUser });
        return { success: true };
      },
      canAccess: (path) => {
        const user = get().user;
        if (!user) return false;
        return checkAccess(user.role, path);
      },
      updateProfile: (data) => {
        const user = get().user;
        if (!user) return;
        const updated = { ...user, ...data };
        set({ user: updated, users: get().users.map((u) => (u.id === user.id ? updated : u)) });
      },
      changePassword: (oldPw, newPw) => {
        const user = get().user;
        if (!user) return { success: false, error: "Chưa đăng nhập." };
        if (user.password !== oldPw) return { success: false, error: "Mật khẩu hiện tại không đúng." };
        const updated = { ...user, password: newPw };
        set({ user: updated, users: get().users.map((u) => (u.id === user.id ? updated : u)) });
        return { success: true };
      },
    }),
    {
      name: "kfc-sync-auth",
      partialize: (state) => ({ user: state.user, users: state.users }),
    }
  )
);

// Returns true only after Zustand has finished reading localStorage.
// Prevents auth redirects from firing before the persisted session loads.
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // This runs client-side only — safe to access persist API here
    if (useAuthStore.persist?.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist?.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);
  return hydrated;
}
