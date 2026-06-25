"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Plus, Minus, Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePolling } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { MENU_CATEGORIES } from "@/lib/types";
import type { MenuCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { translate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";

interface DbMenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  imageEmoji: string;
  imageUrl: string;
  available: boolean;
  popular: boolean;
  prepTime: number;
}

const CAT_KEYS: Record<string, Parameters<typeof translate>[0]> = {
  ga_ran: "cat_ga_ran", burger: "cat_burger", combo: "cat_combo",
  mon_phu: "cat_mon_phu", trang_miem: "cat_trang_miem", do_uong: "cat_do_uong", com: "cat_com",
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart, cart, cartItemCount, language } = useAppStore();
  const tr = (key: Parameters<typeof translate>[0]) => translate(key, language);
  const count = cartItemCount();

  const { data: allItems, loading } = usePolling<DbMenuItem[]>("/api/menu?available=true", 30000);

  const getItems = (): DbMenuItem[] => {
    if (!allItems) return [];
    const q = searchQuery.trim().toLowerCase();
    if (q) return allItems.filter((i) => i.name.toLowerCase().includes(q));
    if (activeCategory === "all") return allItems;
    return allItems.filter((i) => i.category === activeCategory);
  };

  const items = getItems();
  const popularItems = (allItems ?? []).filter((i) => i.popular).slice(0, 4);

  const getCartQty = (itemId: string) =>
    cart.find((c) => c.menuItem.id === itemId)?.quantity ?? 0;

  const handleAdd = (item: DbMenuItem) => {
    addToCart(
      { id: item.id, name: item.name, nameEn: "", description: item.description ?? "", price: item.price, category: item.category as MenuCategory, image: item.imageEmoji, popular: item.popular, prepTime: item.prepTime, available: item.available },
      1
    );
    toast.success(`Đã thêm ${item.name}`, { description: "Vào giỏ hàng", duration: 2000 });
  };

  if (loading && !allItems) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#E4002B]" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{tr("menu_title")}</h1>
          <p className="text-sm text-gray-500">{tr("menu_subtitle")}</p>
        </div>
        {count > 0 && (
          <Link href="/customer/cart">
            <Button className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {tr("menu_view_cart")} ({count})
            </Button>
          </Link>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={tr("menu_search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === "all" && !searchQuery
              ? "bg-[#E4002B] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-[#E4002B] hover:text-[#E4002B]"
          }`}
        >
          🍽️ {tr("cat_all")}
        </button>
        {(Object.entries(MENU_CATEGORIES) as [MenuCategory, (typeof MENU_CATEGORIES)[MenuCategory]][]).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => { setActiveCategory(key); setSearchQuery(""); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === key && !searchQuery
                ? "bg-[#E4002B] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#E4002B] hover:text-[#E4002B]"
            }`}
          >
            {cat.emoji} {CAT_KEYS[key] ? tr(CAT_KEYS[key]) : cat.label}
          </button>
        ))}
      </div>

      {activeCategory === "all" && !searchQuery && popularItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-[#E4002B]" />
            <h2 className="font-bold text-gray-900">{tr("menu_popular")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularItems.map((item) => (
              <PopularCard key={item.id} item={item} qty={getCartQty(item.id)} onAdd={() => handleAdd(item)} addLabel={tr("menu_add")} />
            ))}
          </div>
        </div>
      )}

      <div>
        {searchQuery && (
          <div className="mb-4 text-sm text-gray-500">
            {tr("menu_found")} <strong>{items.length}</strong> {tr("menu_results_for")} &quot;{searchQuery}&quot;
          </div>
        )}
        {!searchQuery && activeCategory !== "all" && (
          <h2 className="font-bold text-gray-900 mb-4">
            {MENU_CATEGORIES[activeCategory as MenuCategory].emoji} {CAT_KEYS[activeCategory] ? tr(CAT_KEYS[activeCategory]) : MENU_CATEGORIES[activeCategory as MenuCategory].label}
          </h2>
        )}
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-medium">{tr("menu_no_results")}</p>
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
                  prepLabel={tr("menu_prep_min")}
                  addLabel={tr("menu_add")}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {count > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-auto z-40"
        >
          <Link href="/customer/cart">
            <Button size="lg" className="w-full md:w-auto shadow-2xl font-bold">
              <ShoppingCart className="h-5 w-5" />
              {tr("menu_view_cart")} · {count} {tr("menu_items_unit")}
            </Button>
          </Link>
        </motion.div>
      )}
    </PageWrapper>
  );
}

function ItemImage({ item, className }: { item: DbMenuItem; className: string }) {
  if (item.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.imageUrl} alt={item.name} className={`object-cover ${className}`} loading="lazy" />
    );
  }
  return <div className={`flex items-center justify-center text-4xl bg-orange-50 ${className}`}>{item.imageEmoji}</div>;
}

function PopularCard({ item, qty, onAdd, addLabel }: { item: DbMenuItem; qty: number; onAdd: () => void; addLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all"
    >
      <ItemImage item={item} className="w-full h-28 rounded-t-xl" />
      <div className="p-3">
        <div className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</div>
        <div className="text-[#E4002B] font-bold text-sm mb-2">{formatCurrency(item.price)}</div>
        <Button size="sm" onClick={onAdd} className="w-full text-xs">
          <Plus className="h-3 w-3" /> {addLabel}
        </Button>
      </div>
    </motion.div>
  );
}

function MenuItemCard({ item, qty, onAdd, prepLabel, addLabel }: { item: DbMenuItem; qty: number; onAdd: () => void; prepLabel: string; addLabel: string }) {
  const { updateCartQuantity, removeFromCart } = useAppStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="h-full hover:shadow-md transition-all overflow-hidden">
        <ItemImage item={item} className="w-full h-36" />
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h3>
            {item.popular && (
              <Badge variant="default" className="text-xs px-1.5 py-0.5 flex-shrink-0">🔥 Hot</Badge>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mb-1 line-clamp-2">{item.description}</p>
          )}
          <div className="text-xs text-gray-400 mb-2">⏱ {item.prepTime} {prepLabel}</div>
          <div className="flex items-center justify-between">
            <span className="font-black text-[#E4002B]">{formatCurrency(item.price)}</span>
            {qty === 0 ? (
              <Button size="sm" onClick={onAdd} className="h-8 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1" /> {addLabel}
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
