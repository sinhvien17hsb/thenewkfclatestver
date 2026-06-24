// ===== USER ROLES =====
export type UserRole = "customer" | "kitchen" | "supervisor" | "manager";

export const USER_ROLES: Record<UserRole, { label: string; labelVi: string; color: string; description: string }> = {
  customer: {
    label: "Customer",
    labelVi: "Khách hàng",
    color: "#E4002B",
    description: "Đặt món, theo dõi đơn hàng, gửi phản hồi",
  },
  kitchen: {
    label: "Kitchen Staff",
    labelVi: "Nhân viên bếp",
    color: "#F97316",
    description: "Quản lý đơn hàng, thực hiện SOP, kiểm soát chất lượng",
  },
  supervisor: {
    label: "Shift Supervisor",
    labelVi: "Giám sát ca",
    color: "#8B5CF6",
    description: "Giám sát ca làm việc, phân bổ nhân sự, xử lý sự cố",
  },
  manager: {
    label: "Store Manager",
    labelVi: "Quản lý cửa hàng",
    color: "#10B981",
    description: "Dashboard tổng quan, phân tích KPI, quản lý chất lượng",
  },
};

// ===== MENU =====
export type MenuCategory =
  | "ga_ran"
  | "burger"
  | "com"
  | "do_uong"
  | "combo"
  | "trang_miem";

export const MENU_CATEGORIES: Record<MenuCategory, { label: string; emoji: string; color: string }> = {
  ga_ran: { label: "Gà Rán", emoji: "🍗", color: "#E4002B" },
  burger: { label: "Burger", emoji: "🍔", color: "#F97316" },
  com: { label: "Cơm", emoji: "🍚", color: "#EAB308" },
  do_uong: { label: "Đồ Uống", emoji: "🥤", color: "#3B82F6" },
  combo: { label: "Combo", emoji: "🎁", color: "#8B5CF6" },
  trang_miem: { label: "Tráng Miệng", emoji: "🍦", color: "#EC4899" },
};

export interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  popular: boolean;
  spicy?: boolean;
  prepTime: number; // minutes
  calories?: number;
  available: boolean;
}

// ===== ORDERS =====
export type OrderStatus =
  | "queued"
  | "preparing"
  | "quality_check"
  | "ready"
  | "completed"
  | "cancelled";

export type OrderPriority = "critical" | "high" | "medium" | "low";

export type CustomerType = "dine_in" | "takeaway" | "online" | "vip";

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: number;
  customerName: string;
  customerType: CustomerType;
  items: OrderItem[];
  status: OrderStatus;
  priority: OrderPriority;
  priorityScore: number;
  priorityReason?: string;
  totalAmount: number;
  estimatedTime: number; // minutes
  elapsedTime: number; // minutes
  createdAt: string;
  updatedAt: string;
  branchId: string;
  assignedTo?: string; // employee ID
  notes?: string;
  complexityScore: number;
}

// ===== CART =====
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

// ===== EMPLOYEES =====
export type EmployeeRole = "cashier" | "kitchen" | "supervisor" | "manager";
export type ShiftTime = "morning" | "afternoon" | "evening";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  avatar: string;
  branchId: string;
  shift: ShiftTime;
  ordersProcessed: number;
  avgPrepTime: number; // minutes
  qualityCompliance: number; // percentage
  customerRating: number; // 1-5
  attendanceRate: number; // percentage
  performanceScore: number; // 0-100
  weeklyOrders: number[];
  badge?: string;
  joinDate: string;
}

// ===== BRANCHES =====
export interface BranchQualityScore {
  foodQuality: number;
  service: number;
  cleanliness: number;
  sopCompliance: number;
  avgWaitingTime: number;
  overallScore: number;
  customerSatisfaction: number;
  totalOrders: number;
  monthlyRevenue: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  manager: string;
  employeeCount: number;
  quality: BranchQualityScore;
  openHours: string;
  status: "open" | "closed" | "maintenance";
  rank?: number;
}

// ===== SOP =====
export type SOPCategory =
  | "chicken_prep"
  | "food_safety"
  | "hygiene"
  | "service"
  | "closing";

export interface SOPStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  requiredTime: number; // seconds
  critical: boolean; // if skipped = major violation
}

export interface SOPChecklist {
  id: string;
  category: SOPCategory;
  title: string;
  steps: SOPStep[];
  frequency: "each_batch" | "each_shift" | "daily" | "weekly";
}

export interface SOPCompletion {
  id: string;
  checklistId: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  completedSteps: string[];
  skippedSteps: string[];
  completedAt: string;
  shiftTime: ShiftTime;
  complianceRate: number;
  notes?: string;
}

// ===== FEEDBACK =====
export interface CustomerFeedback {
  id: string;
  orderId: string;
  branchId: string;
  ratings: {
    foodQuality: number;
    service: number;
    cleanliness: number;
    waitingTime: number;
  };
  comment: string;
  createdAt: string;
  sentiment: "positive" | "neutral" | "negative";
  responded: boolean;
}

// ===== ALERTS =====
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertType =
  | "quality_drop"
  | "sop_violation"
  | "wait_time"
  | "satisfaction"
  | "understaffed"
  | "kitchen_overload";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  branchId: string;
  branchName: string;
  title: string;
  description: string;
  rootCause: string;
  suggestedAction: string;
  metric?: number;
  threshold?: number;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

// ===== SHIFTS =====
export interface Shift {
  id: string;
  branchId: string;
  shiftTime: ShiftTime;
  date: string;
  startTime: string;
  endTime: string;
  requiredStaff: number;
  actualStaff: number;
  employees: string[];
  ordersHandled: number;
  peakOrders: number;
  avgWaitTime: number;
  status: "normal" | "understaffed" | "overloaded";
}

// ===== ANALYTICS =====
export interface HourlyData {
  hour: string;
  orders: number;
  avgWaitTime: number;
  revenue: number;
}

export interface DailyMetrics {
  date: string;
  totalOrders: number;
  avgWaitTime: number;
  satisfaction: number;
  revenue: number;
  sopCompliance: number;
  qualityScore: number;
}

// ===== QUEUE =====
export interface QueueStatus {
  currentLength: number;
  avgWaitingTime: number;
  kitchenLoad: number; // percentage
  predictedWaitTime: number;
  highTrafficAlert: boolean;
  ordersInProgress: number;
  completedToday: number;
}

// ===== AUTH =====
export type AuthRole = "kitchen" | "supervisor" | "manager";

export const AUTH_ROLE_LABELS: Record<AuthRole, string> = {
  kitchen: "Nhân viên bếp",
  supervisor: "Giám sát ca",
  manager: "Quản lý cửa hàng",
};

export const AUTH_ROLE_COLORS: Record<AuthRole, { bg: string; text: string; dot: string }> = {
  kitchen: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  supervisor: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  manager: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

export const AUTH_ROLE_AVATARS: Record<AuthRole, string> = {
  kitchen: "👨‍🍳",
  supervisor: "🎯",
  manager: "👔",
};

export const BRANCH_OPTIONS = [
  { id: "b001", name: "KFC Vincom Bà Triệu" },
  { id: "b002", name: "KFC Lê Văn Lương" },
  { id: "b003", name: "KFC Trần Duy Hưng" },
  { id: "b004", name: "KFC Royal City" },
  { id: "b005", name: "KFC Aeon Mall Long Biên" },
] as const;

export const STORE_ACCESS_CODE = "KFCNHOM17";

export const ROLE_PERMISSIONS: Record<AuthRole, string[]> = {
  kitchen: ["/kitchen"],
  supervisor: ["/kitchen", "/manager/shifts"],
  manager: ["/kitchen", "/manager"],
};

export interface AuthUser {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  password: string;
  role: AuthRole;
  branchId: string;
  branchName: string;
  registeredAt: string;
  avatar: string;
}
