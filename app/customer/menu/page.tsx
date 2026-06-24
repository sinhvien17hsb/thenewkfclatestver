"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Plus, Minus, Flame, Filter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { menuItems, getMenuByCategory, searchMenuItems } from "@/lib/data/menu";
import { useAppStore } from "@/lib/store";
import { MENU_CATEGORIES } from "@/lib/types";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart, cart, cartItemCount } = useAppStore();
  const count = cartItemCount();

  const getItems = () => {
    if (searchQuery.trim()) return searchMenuItems(searchQuery);
    if (activeCategory === "all") return menuItems.filter((i) => i.available);
    return getMenuByCategory(activeCategory);
  };

  const items = getItems();

  const getCartQty = (itemId: string) => {
    const ci = cart.find((c) => c.menuItem.id === itemId);
    return ci?.quantity ?? 0;
  };

  const handleAdd = (item: MenuItem) => {
    addToCart(item, 1);
    toast.success(`Đã thêm ${item.name}`, {
      description: "Vào giỏ hàng",
      duration: 2000,
    });
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Thực đơn KFC</h1>
          <p className="text-sm text-gray-500">Chọn món yêu thích của bạn</p>
        </div>
        {count > 0 && (
          <Link href="/customer/cart">
            <Button className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Giỏ hàng ({count})
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm món ăn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === "all" && !searchQuery
              ? "bg-[#E4002B] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-[#E4002B] hover:text-[#E4002B]"
          }`}
        >
          🍽️ Tất cả
        </button>
        {(Object.entries(MENU_CATEGORIES) as [MenuCategory, typeof MENU_CATEGORIES[MenuCategory]][]).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => { setActiveCategory(key); setSearchQuery(""); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === key && !searchQuery
                ? "bg-[#E4002B] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#E4002B] hover:text-[#E4002B]"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Popular section */}
      {activeCategory === "all" && !searchQuery && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-[#E4002B]" />
            <h2 className="font-bold text-gray-900">Phổ biến nhất</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {menuItems.filter((i) => i.popular && i.available).slice(0, 4).map((item) => (
              <PopularCard key={item.id} item={item} qty={getCartQty(item.id)} onAdd={() => handleAdd(item)} />
            ))}
          </div>
        </div>
      )}

      {/* Items grid */}
      <div>
        {searchQuery && (
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Tìm thấy <strong>{items.length}</strong> kết quả cho &quot;{searchQuery}&quot;
            </span>
          </div>
        )}
        {!searchQuery && activeCategory !== "all" && (
          <h2 className="font-bold text-gray-900 mb-4">
            {MENU_CATEGORIES[activeCategory as MenuCategory].emoji} {MENU_CATEGORIES[activeCategory as MenuCategory].label}
          </h2>
        )}
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-medium">Không tìm thấy món ăn phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  qty={getCartQty(item.id)}
                  onAdd={() => handleAdd(item)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sticky cart button for mobile */}
      {count > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-auto z-40"
        >
          <Link href="/customer/cart">
            <Button size="lg" className="w-full md:w-auto shadow-2xl font-bold">
              <ShoppingCart className="h-5 w-5" />
              Xem giỏ hàng · {count} món
            </Button>
          </Link>
        </motion.div>
      )}
    </PageWrapper>
  );
}

function PopularCard({ item, qty, onAdd }: { item: MenuItem; qty: number; onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all"
    >
      <div className="text-4xl text-center mb-2">{item.image}</div>
      <div className="text-sm font-semibold text-gray-900 text-center mb-1 line-clamp-1">{item.name}</div>
      <div className="text-center text-[#E4002B] font-bold text-sm mb-2">{formatCurrency(item.price)}</div>
      <Button size="sm" onClick={onAdd} className="w-full text-xs">
        <Plus className="h-3 w-3" /> Thêm
      </Button>
    </motion.div>
  );
}

function MenuItemCard({ item, qty, onAdd }: { item: MenuItem; qty: number; onAdd: () => void }) {
  const { updateCartQuantity, removeFromCart } = useAppStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="h-full hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="text-5xl flex-shrink-0">{item.image}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h3>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {item.popular && <Badge variant="default" className="text-xs px-1.5 py-0.5">🔥 Hot</Badge>}
                  {item.spicy && <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-1.5 py-0.5">🌶️ Cay</Badge>}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">⏱ {item.prepTime}p</span>
                {item.calories && <span className="text-xs text-gray-400">· {item.calories} kcal</span>}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-black text-[#E4002B]">{formatCurrency(item.price)}</span>
                {qty === 0 ? (
                  <Button size="sm" onClick={onAdd} className="h-8 px-3 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Thêm
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => qty === 1 ? removeFromCart(item.id) : updateCartQuantity(item.id, qty - 1)}
                      className="w-7 h-7 rounded-full border-2 border-[#E4002B] text-[#E4002B] flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{qty}</span>
                    <button
                      onClick={onAdd}
                      className="w-7 h-7 rounded-full bg-[#E4002B] text-white flex items-center justify-center hover:bg-[#BB0020] transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
