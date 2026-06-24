import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "KFC Sync - AI-Powered Restaurant Operations Platform",
  description:
    "Nền tảng chuyển đổi số nhà hàng KFC: Tích hợp đặt hàng thông minh, quản lý bếp AI, kiểm soát chất lượng và phân tích dữ liệu thời gian thực.",
  keywords: "KFC, restaurant management, digital transformation, AI, POS, quality control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 min-h-screen">
        <Navbar />
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontFamily: "inherit",
            },
          }}
        />
      </body>
    </html>
  );
}
