"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserRole,
  CartItem,
  MenuItem,
  Order,
  OrderStatus,
  Alert,
  AuthUser,
  AuthRole,
} from "@/lib/types";
import { ROLE_PERMISSIONS, AUTH_ROLE_AVATARS } from "@/lib/types";
import { initialOrders } from "@/lib/data/orders";
import { alerts as initialAlerts } from "@/lib/data/alerts";
import {
  generateOrderId,
  calculatePriorityScore,
  getPriorityFromScore,
} from "@/lib/utils";

// ===== APP STORE =====
interface AppStore {
  role: UserRole;
  setRole: (role: UserRole) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartItemCount: () => number;

  // Orders (customer view)
  customerOrders: Order[];
  placeOrder: (tableNumber?: number, customerName?: string) => Order | null;
  currentTrackingOrderId: string | null;
  setCurrentTrackingOrder: (orderId: string | null) => void;

  // Table
  tableNumber: number | null;
  setTableNumber: (num: number | null) => void;

  // Notifications
  notificationCount: number;
  clearNotifications: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      role: "customer",
      setRole: (role) => set({ role }),

      // Cart
      cart: [],
      addToCart: (item, quantity = 1, notes) => {
        const cart = get().cart;
        const existing = cart.find((c) => c.menuItem.id === item.id);
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.menuItem.id === item.id
                ? { ...c, quantity: c.quantity + quantity }
                : c
            ),
          });
        } else {
          set({ cart: [...cart, { menuItem: item, quantity, notes }] });
        }
      },
      removeFromCart: (itemId) =>
        set({ cart: get().cart.filter((c) => c.menuItem.id !== itemId) }),
      updateCartQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }
        set({
          cart: get().cart.map((c) =>
            c.menuItem.id === itemId ? { ...c, quantity } : c
          ),
        });
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () =>
        get().cart.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        ),
      cartItemCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),

      // Orders
      customerOrders: [],
      placeOrder: (tableNumber, customerName = "Khách hàng") => {
        const cart = get().cart;
        if (cart.length === 0) return null;

        const waitScore = calculatePriorityScore(0, cart.length, "dine_in", 50);
        const priority = getPriorityFromScore(waitScore);
        const totalAmount = get().cartTotal();

        const newOrder: Order = {
          id: `o${Date.now()}`,
          orderNumber: generateOrderId(),
          tableNumber: tableNumber ?? get().tableNumber ?? undefined,
          customerName,
          customerType: "dine_in",
          items: cart.map((c) => ({
            menuItemId: c.menuItem.id,
            name: c.menuItem.name,
            quantity: c.quantity,
            price: c.menuItem.price,
            notes: c.notes,
          })),
          status: "queued",
          priority,
          priorityScore: waitScore,
          totalAmount,
          estimatedTime: Math.ceil(cart.reduce((s, c) => s + c.menuItem.prepTime * c.quantity, 0) / 2),
          elapsedTime: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          branchId: "b001",
          complexityScore: Math.min(cart.length * 2, 10),
        };

        set({
          customerOrders: [newOrder, ...get().customerOrders],
          currentTrackingOrderId: newOrder.id,
        });
        get().clearCart();
        return newOrder;
      },
      currentTrackingOrderId: null,
      setCurrentTrackingOrder: (orderId) =>
        set({ currentTrackingOrderId: orderId }),

      // Table
      tableNumber: null,
      setTableNumber: (num) => set({ tableNumber: num }),

      // Notifications
      notificationCount: 3,
      clearNotifications: () => set({ notificationCount: 0 }),
    }),
    {
      name: "kfc-sync-app",
      partialize: (state) => ({
        role: state.role,
        tableNumber: state.tableNumber,
      }),
    }
  )
);

// ===== KITCHEN STORE =====
interface KitchenStore {
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOrder: (order: Order) => void;
  activeFilter: OrderStatus | "all";
  setActiveFilter: (filter: OrderStatus | "all") => void;
  kitchenLoad: number;
  isHighTraffic: boolean;
}

export const useKitchenStore = create<KitchenStore>((set, get) => ({
  orders: initialOrders,
  updateOrderStatus: (orderId, status) => {
    set({
      orders: get().orders.map((o) =>
        o.id === orderId
          ? { ...o, status, updatedAt: new Date().toISOString() }
          : o
      ),
    });
  },
  addOrder: (order) => set({ orders: [order, ...get().orders] }),
  activeFilter: "all",
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  kitchenLoad: 72,
  isHighTraffic: true,
}));

// ===== MANAGER STORE =====
interface ManagerStore {
  alerts: Alert[];
  resolveAlert: (alertId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branchId: string) => void;
  dateRange: "today" | "week" | "month";
  setDateRange: (range: "today" | "week" | "month") => void;
}

export const useManagerStore = create<ManagerStore>((set, get) => ({
  alerts: initialAlerts,
  resolveAlert: (alertId) => {
    set({
      alerts: get().alerts.map((a) =>
        a.id === alertId
          ? { ...a, resolved: true, resolvedAt: new Date().toISOString() }
          : a
      ),
    });
  },
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedBranch: "b001",
  setSelectedBranch: (branchId) => set({ selectedBranch: branchId }),
  dateRange: "today",
  setDateRange: (range) => set({ dateRange: range }),
}));

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
  return allowed.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );
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
          (u) =>
            (u.employeeId === idOrEmail || u.email === idOrEmail) &&
            u.password === password
        );
        if (!found) return { success: false, error: "Mã nhân viên/email hoặc mật khẩu không đúng." };
        set({ user: found });
        return { success: true };
      },
      logout: () => set({ user: null }),
      register: (data) => {
        const exists = get().users.find(
          (u) => u.employeeId === data.employeeId || u.email === data.email
        );
        if (exists) return { success: false, error: "Mã nhân viên hoặc email đã tồn tại." };
        const newUser: AuthUser = {
          ...data,
          id: `user_${Date.now()}`,
          registeredAt: new Date().toISOString(),
        };
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
