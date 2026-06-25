"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock, Star, ChevronRight, ShoppingCart, MapPin,
  UtensilsCrossed, Package, MessageSquare, Flame
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getPopularItems } from "@/lib/data/menu";
import { MENU_CATEGORIES } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const QUEUE_STATS = { waitTime: 12, activeOrders: 8, openStatus: true };

const categories = Object.entries(MENU_CATEGORIES).map(([key, val]) => ({
  key,
  ...val,
  href: `/customer/menu?category=${key}`,
}));

export default function CustomerHome() {
  const { addToCart, cartItemCount } = useAppStore();
  const popular = getPopularItems().slice(0, 6);
  const count = cartItemCount();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">

      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kfc-banner.jpeg"
          alt="KFC Banner"
          className="w-full h-56 md:h-72 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <MapPin className="h-4 w-4 text-red-300" />
            <span className="text-sm text-red-100 font-medium">KFC Vincom Bà Triệu</span>
            <span className="ml-auto flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${QUEUE_STATS.openStatus ? "bg-green-300" : "bg-gray-300"}`} />
              {QUEUE_STATS.openStatus ? "Đang mở cửa" : "Đã đóng cửa"}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-white drop-shadow mb-1"
          >
            Xin chào! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-red-100 text-sm mb-4"
          >
            Hôm nay bạn muốn ăn gì?
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-white/20">
              <Clock className="h-4 w-4 text-yellow-300" />
              <div>
                <div className="text-[10px] text-gray-300">Thời gian chờ</div>
                <div className="text-sm font-black text-white">~{QUEUE_STATS.waitTime} phút</div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-white/20">
              <UtensilsCrossed className="h-4 w-4 text-yellow-300" />
              <div>
                <div className="text-[10px] text-gray-300">Đơn đang làm</div>
                <div className="text-sm font-black text-white">{QUEUE_STATS.activeOrders} đơn</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 space-y-6 mt-6">

        {/* ===== POPULAR ===== */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#E4002B]" />
              <h2 className="font-black text-gray-900 text-base">Phổ biến hôm nay</h2>
            </div>
            <Link href="/customer/menu" className="text-xs text-[#E4002B] font-semibold flex items-center gap-1">
              Xem thêm <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {popular.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex-shrink-0 w-40"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 h-24 flex items-center justify-center text-5xl">
                    {item.image}
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-gray-900 leading-tight line-clamp-2 mb-1">
                      {item.name}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#E4002B]">
                        {formatCurrency(item.price)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-6 h-6 rounded-full bg-[#E4002B] text-white flex items-center justify-center text-lg font-bold hover:bg-[#BB0020] transition-colors leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-[#E4002B]" />
            <h2 className="font-black text-gray-900 text-base">Danh mục</h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={cat.href}
                  className="flex flex-col items-center gap-2 p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#E4002B]/30 hover:bg-red-50/30 transition-all group"
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="text-xs font-bold text-gray-700 text-center">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <Link href="/customer/menu">
          <Button className="w-full h-13 text-base rounded-2xl shadow-md">
            <UtensilsCrossed className="h-5 w-5 mr-2" />
            Xem toàn bộ thực đơn
          </Button>
        </Link>

        {/* ===== QUICK LINKS ===== */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/customer/orders", icon: Package, label: "Đơn hàng", desc: "Theo dõi đơn" },
            { href: "/customer/cart", icon: ShoppingCart, label: "Giỏ hàng", desc: count > 0 ? `${count} món` : "Trống" },
            { href: "/customer/feedback", icon: MessageSquare, label: "Đánh giá", desc: "Góp ý dịch vụ" },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href}>
              <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100 hover:border-[#E4002B]/30 transition-all">
                <Icon className="h-5 w-5 mx-auto mb-1.5 text-[#E4002B]" />
                <div className="text-xs font-bold text-gray-800">{label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{desc}</div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
