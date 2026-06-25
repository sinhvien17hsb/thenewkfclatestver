"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  Clock, Star, ChevronRight, ShoppingCart, MapPin,
  UtensilsCrossed, Package, MessageSquare, Flame, ChevronLeft
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MENU_CATEGORIES } from "@/lib/types";
import type { MenuCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { translate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface DbMenuItem {
  id: string; name: string; description: string | null;
  category: string; price: number; imageEmoji: string;
  imageUrl: string; available: boolean; popular: boolean; prepTime: number;
}

const QUEUE_STATS = { waitTime: 12, activeOrders: 8, openStatus: true };

const categories = Object.entries(MENU_CATEGORIES).map(([key, val]) => ({
  key,
  ...val,
  href: `/customer/menu?category=${key}`,
}));

export default function CustomerHome() {
  const { addToCart, cartItemCount, language } = useAppStore();
  const tr = (key: Parameters<typeof translate>[0]) => translate(key, language);
  const count = cartItemCount();
  const [popular, setPopular] = useState<DbMenuItem[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideDir = useRef(1);

  useEffect(() => {
    fetch("/api/menu?available=true")
      .then((r) => r.json())
      .then((items: DbMenuItem[]) => setPopular(items.filter((i) => i.popular).slice(0, 8)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (popular.length < 2 || paused) return;
    const t = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % popular.length);
      slideDir.current = 1;
    }, 3000);
    return () => clearInterval(t);
  }, [popular.length, paused]);

  const goTo = (idx: number, dir: number) => {
    slideDir.current = dir;
    setSlideIndex((idx + popular.length) % popular.length);
  };

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
              {QUEUE_STATS.openStatus ? tr("home_open") : tr("home_closed")}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-white drop-shadow mb-1"
          >
            {language === "en" ? "Hello! 👋" : "Xin chào! 👋"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-red-100 text-sm mb-4"
          >
            {language === "en" ? "What would you like today?" : "Hôm nay bạn muốn ăn gì?"}
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
                <div className="text-[10px] text-gray-300">{tr("home_wait_time")}</div>
                <div className="text-sm font-black text-white">~{QUEUE_STATS.waitTime} {language === "en" ? "min" : "phút"}</div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-white/20">
              <UtensilsCrossed className="h-4 w-4 text-yellow-300" />
              <div>
                <div className="text-[10px] text-gray-300">{tr("home_active_orders")}</div>
                <div className="text-sm font-black text-white">{QUEUE_STATS.activeOrders} {language === "en" ? "orders" : "đơn"}</div>
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
              <h2 className="font-black text-gray-900 text-base">{tr("home_popular")}</h2>
            </div>
            <Link href="/customer/menu" className="text-xs text-[#E4002B] font-semibold flex items-center gap-1">
              {tr("home_see_more")} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {popular.length > 0 && (
            <div
              className="relative overflow-hidden rounded-2xl"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Slide area */}
              <div className="relative h-64">
                <AnimatePresence initial={false} custom={slideDir.current}>
                  {popular[slideIndex] && (() => {
                    const item = popular[slideIndex];
                    return (
                      <motion.div
                        key={slideIndex}
                        custom={slideDir.current}
                        variants={{
                          enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
                          center: { x: 0, opacity: 1 },
                          exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "tween", duration: 0.35 }}
                        className="absolute inset-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                      >
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" loading="lazy" />
                        ) : (
                          <div className="bg-gradient-to-br from-red-50 to-orange-50 h-40 flex items-center justify-center text-7xl">
                            {item.imageEmoji}
                          </div>
                        )}
                        <div className="p-3 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">{item.name}</div>
                            <div className="text-base font-black text-[#E4002B] mt-0.5">{formatCurrency(item.price)}</div>
                          </div>
                          <button
                            onClick={() => addToCart({
                              id: item.id, name: item.name, nameEn: "", description: item.description ?? "",
                              price: item.price, category: item.category as MenuCategory,
                              image: item.imageEmoji, popular: item.popular,
                              prepTime: item.prepTime, available: item.available,
                            })}
                            className="flex-shrink-0 w-9 h-9 rounded-full bg-[#E4002B] text-white flex items-center justify-center text-xl font-bold hover:bg-[#BB0020] transition-colors shadow-md"
                          >
                            +
                          </button>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>

              {/* Prev / Next arrows */}
              <button
                onClick={() => goTo(slideIndex - 1, -1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-gray-700 hover:bg-white transition z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => goTo(slideIndex + 1, 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-gray-700 hover:bg-white transition z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 z-10">
                {popular.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > slideIndex ? 1 : -1)}
                    className={`h-1.5 rounded-full transition-all ${i === slideIndex ? "w-5 bg-[#E4002B]" : "w-1.5 bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ===== CATEGORIES ===== */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-[#E4002B]" />
            <h2 className="font-black text-gray-900 text-base">{tr("home_categories")}</h2>
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
            {tr("home_view_all_menu")}
          </Button>
        </Link>

        {/* ===== QUICK LINKS ===== */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/customer/orders", icon: Package, label: tr("nav_orders"), desc: tr("home_track_orders") },
            { href: "/customer/cart", icon: ShoppingCart, label: tr("cart_title"), desc: count > 0 ? `${count} ${tr("menu_items_unit")}` : tr("home_cart_empty") },
            { href: "/customer/feedback", icon: MessageSquare, label: tr("nav_feedback"), desc: tr("home_feedback_desc") },
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
