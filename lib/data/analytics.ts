import type { HourlyData, DailyMetrics } from "@/lib/types";

export const hourlyData: HourlyData[] = [
  { hour: "07:00", orders: 8, avgWaitTime: 8, revenue: 620000 },
  { hour: "08:00", orders: 15, avgWaitTime: 10, revenue: 1150000 },
  { hour: "09:00", orders: 12, avgWaitTime: 9, revenue: 920000 },
  { hour: "10:00", orders: 18, avgWaitTime: 11, revenue: 1380000 },
  { hour: "11:00", orders: 42, avgWaitTime: 18, revenue: 3220000 },
  { hour: "12:00", orders: 68, avgWaitTime: 26, revenue: 5220000 },
  { hour: "13:00", orders: 55, avgWaitTime: 22, revenue: 4220000 },
  { hour: "14:00", orders: 30, avgWaitTime: 14, revenue: 2300000 },
  { hour: "15:00", orders: 22, avgWaitTime: 11, revenue: 1690000 },
  { hour: "16:00", orders: 28, avgWaitTime: 13, revenue: 2150000 },
  { hour: "17:00", orders: 45, avgWaitTime: 20, revenue: 3450000 },
  { hour: "18:00", orders: 72, avgWaitTime: 28, revenue: 5520000 },
  { hour: "19:00", orders: 65, avgWaitTime: 24, revenue: 4990000 },
  { hour: "20:00", orders: 48, avgWaitTime: 19, revenue: 3680000 },
  { hour: "21:00", orders: 25, avgWaitTime: 12, revenue: 1920000 },
];

export const dailyMetrics: DailyMetrics[] = [
  { date: "18/06", totalOrders: 482, avgWaitTime: 17.2, satisfaction: 3.8, revenue: 37020000, sopCompliance: 87, qualityScore: 81 },
  { date: "19/06", totalOrders: 510, avgWaitTime: 16.8, satisfaction: 3.9, revenue: 39170000, sopCompliance: 88, qualityScore: 82 },
  { date: "20/06", totalOrders: 498, avgWaitTime: 18.1, satisfaction: 3.7, revenue: 38230000, sopCompliance: 86, qualityScore: 80 },
  { date: "21/06", totalOrders: 544, avgWaitTime: 17.5, satisfaction: 4.0, revenue: 41780000, sopCompliance: 90, qualityScore: 83 },
  { date: "22/06", totalOrders: 568, avgWaitTime: 16.2, satisfaction: 4.1, revenue: 43620000, sopCompliance: 91, qualityScore: 84 },
  { date: "23/06", totalOrders: 592, avgWaitTime: 15.8, satisfaction: 4.2, revenue: 45470000, sopCompliance: 93, qualityScore: 85 },
  { date: "24/06", totalOrders: 247, avgWaitTime: 16.5, satisfaction: 3.9, revenue: 18980000, sopCompliance: 88, qualityScore: 82 },
];

export const topSellingItems = [
  { name: "Gà Rán Original", sales: 1847, revenue: 72033000, category: "Gà Rán" },
  { name: "Combo 1 - Cá Nhân", sales: 1203, revenue: 90225000, category: "Combo" },
  { name: "Zinger Burger", sales: 986, revenue: 59160000, category: "Burger" },
  { name: "Gà Cay Zinger", sales: 878, revenue: 38632000, category: "Gà Rán" },
  { name: "Combo 2 - Gia Đình", sales: 542, revenue: 143630000, category: "Combo" },
  { name: "Colonel Burger", sales: 734, revenue: 40370000, category: "Burger" },
  { name: "Gà Popcorn", sales: 1124, revenue: 39340000, category: "Gà Rán" },
  { name: "Kem Tươi Soft Serve", sales: 2104, revenue: 42080000, category: "Tráng Miệng" },
];

export const branchComparisonData = [
  {
    branch: "Vincom Bà Triệu",
    qualityScore: 83,
    waitTime: 18.5,
    satisfaction: 3.9,
    orders: 1247,
  },
  {
    branch: "Lê Văn Lương",
    qualityScore: 91,
    waitTime: 12.3,
    satisfaction: 4.5,
    orders: 1582,
  },
  {
    branch: "Trần Duy Hưng",
    qualityScore: 87,
    waitTime: 14.8,
    satisfaction: 4.2,
    orders: 1104,
  },
  {
    branch: "Royal City",
    qualityScore: 95,
    waitTime: 9.8,
    satisfaction: 4.8,
    orders: 2103,
  },
  {
    branch: "Aeon Mall",
    qualityScore: 89,
    waitTime: 11.5,
    satisfaction: 4.4,
    orders: 1389,
  },
];

export const customerSatisfactionTrend = [
  { month: "T1", score: 3.7, positive: 58, neutral: 22, negative: 20 },
  { month: "T2", score: 3.8, positive: 61, neutral: 21, negative: 18 },
  { month: "T3", score: 3.6, positive: 56, neutral: 23, negative: 21 },
  { month: "T4", score: 3.9, positive: 64, neutral: 20, negative: 16 },
  { month: "T5", score: 4.0, positive: 66, neutral: 19, negative: 15 },
  { month: "T6", score: 3.9, positive: 63, neutral: 21, negative: 16 },
];

export const feedbackData: Array<{
  id: string;
  customerName: string;
  ratings: { foodQuality: number; service: number; cleanliness: number; waitingTime: number };
  comment: string;
  createdAt: string;
  sentiment: "positive" | "neutral" | "negative";
}> = [
  {
    id: "f001",
    customerName: "Nguyễn Thị Hương",
    ratings: { foodQuality: 5, service: 4, cleanliness: 5, waitingTime: 2 },
    comment: "Gà rán ngon tuyệt! Nhưng thời gian chờ hơi lâu, phải đợi hơn 20 phút mới có món.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentiment: "neutral",
  },
  {
    id: "f002",
    customerName: "Trần Văn Bình",
    ratings: { foodQuality: 5, service: 5, cleanliness: 5, waitingTime: 5 },
    comment: "Dịch vụ tuyệt vời, nhân viên nhiệt tình, đồ ăn ngon. Sẽ quay lại!",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    sentiment: "positive",
  },
  {
    id: "f003",
    customerName: "Phạm Minh Đức",
    ratings: { foodQuality: 3, service: 3, cleanliness: 4, waitingTime: 1 },
    comment: "Chờ quá lâu - gần 30 phút mà vẫn chưa ra. Gà lần này kém giòn hơn trước.",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    sentiment: "negative",
  },
  {
    id: "f004",
    customerName: "Lê Thị Lan",
    ratings: { foodQuality: 4, service: 5, cleanliness: 5, waitingTime: 4 },
    comment: "Nhân viên rất lịch sự và chuyên nghiệp. Đồ ăn ngon, cửa hàng sạch sẽ.",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    sentiment: "positive",
  },
  {
    id: "f005",
    customerName: "Vũ Hoàng Nam",
    ratings: { foodQuality: 2, service: 3, cleanliness: 4, waitingTime: 1 },
    comment: "Gà hôm nay bị chín quá, lớp vỏ cứng và đắng. Chờ đợi rất lâu trong khi hàng người đông.",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    sentiment: "negative",
  },
];
