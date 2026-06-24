"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, Plus, Minus, X, ChevronRight,
  Droplets, Receipt, HandHelping, ClipboardList, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  ALL: { label: "Tất cả", emoji: "🍽️" },
  FRIED_CHICKEN: { label: "Gà Rán", emoji: "🍗" },
  BURGER: { label: "Burger", emoji: "🍔" },
  RICE: { label: "Cơm", emoji: "🍚" },
  DRINKS: { label: "Đồ Uống", emoji: "🥤" },
  COMBO: { label: "Combo", emoji: "🎁" },
  DESSERT: { label: "Tráng Miệng", emoji: "🍦" },
};

const SERVICE_REQUESTS = [
  { type: "WATER", label: "Nước uống", icon: Droplets },
  { type: "TISSUE", label: "Khăn giấy", icon: ClipboardList },
  { type: "BILL", label: "Thanh toán", icon: Receipt },
  { type: "ASSISTANCE", label: "Hỗ trợ", icon: HandHelping },
];

interface MenuItem {
  id: string; name: string; description?: string;
  category: string; price: number; imageEmoji: string;
}

function OrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get("table") ?? "01";

  const { items: cartItems, addItem, removeItem, updateQty, total, count, setTableNumber } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [cartOpen, setCartOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => { setTableNumber(tableNumber); }, [tableNumber, setTableNumber]);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/menu");
    const data = await res.json();
    setMenuItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const filtered = menuItems.filter((m) => {
    const matchCat = activeCategory === "ALL" || m.category === activeCategory;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleServiceRequest = async (type: string, label: string) => {
    await fetch("/api/service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber, type }),
    });
    toast.success(`Yêu cầu "${label}" đã được gửi! Nhân viên sẽ đến ngay.`);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setPlacingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          items: cartItems.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: i.notes })),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const order = await res.json();
      useCart.getState().clearCart();
      setCartOpen(false);
      router.push(`/order-tracking?orderId=${order.id}`);
    } catch {
      toast.error("Không thể đặt hàng. Vui lòng thử lại.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const cartCount = count();
  const cartTotal = total();

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-6">
      {/* Header */}
      <div className="bg-[#E4002B] text-white sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-black text-lg">Đặt món</div>
            <div className="text-red-100 text-xs">Bàn số {tableNumber}</div>
          </div>
          <div className="flex gap-2">
            {SERVICE_REQUESTS.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => handleServiceRequest(type, label)}
                className="flex flex-col items-center gap-0.5 bg-white/20 hover:bg-white/30 rounded-xl px-2.5 py-1.5 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm món ăn..."
            className="pl-9 bg-white rounded-2xl border-0 shadow-sm h-11"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === key
                  ? "bg-[#E4002B] text-white"
                  : "bg-white text-gray-600 shadow-sm"
              }`}
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#E4002B] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="font-medium">
              {menuItems.length === 0
                ? "Thực đơn đang được cập nhật bởi quản lý."
                : "Không tìm thấy món phù hợp."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => {
              const inCart = cartItems.find((c) => c.menuItemId === item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 h-28 flex items-center justify-center text-5xl">
                    {item.imageEmoji}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight mb-1">
                      {item.name}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-400 line-clamp-1 mb-2">{item.description}</div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#E4002B]">{formatCurrency(item.price)}</span>
                      {inCart ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQty(item.id, inCart.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{inCart.quantity}</span>
                          <button
                            onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price, imageEmoji: item.imageEmoji })}
                            className="w-6 h-6 rounded-full bg-[#E4002B] text-white flex items-center justify-center hover:bg-[#BB0020]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            addItem({ menuItemId: item.id, name: item.name, price: item.price, imageEmoji: item.imageEmoji });
                            toast.success(`Đã thêm ${item.name}`);
                          }}
                          className="w-7 h-7 rounded-full bg-[#E4002B] text-white flex items-center justify-center hover:bg-[#BB0020] text-xl font-bold leading-none"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 px-4"
        >
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full bg-[#1A1A1A] text-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="bg-[#E4002B] rounded-xl px-2 py-0.5 text-xs font-black">{cartCount}</span>
                <span className="font-bold">Xem giỏ hàng</span>
              </div>
              <span className="font-black">{formatCurrency(cartTotal)}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-black text-lg">Giỏ hàng · Bàn {tableNumber}</h2>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.menuItemId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <span className="text-2xl">{item.imageEmoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs text-[#E4002B] font-bold mt-0.5">{formatCurrency(item.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.menuItemId, item.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => addItem({ menuItemId: item.menuItemId, name: item.name, price: item.price, imageEmoji: item.imageEmoji })} className="w-7 h-7 rounded-full bg-[#E4002B] text-white flex items-center justify-center">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeItem(item.menuItemId)} className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between font-black text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-[#E4002B]">{formatCurrency(cartTotal)}</span>
                </div>
                <Button onClick={handlePlaceOrder} disabled={placingOrder} className="w-full h-12 text-base rounded-2xl">
                  {placingOrder ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang đặt...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ChevronRight className="h-5 w-5" /> Đặt hàng ngay
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 text-[#E4002B] animate-spin" /></div>}>
      <OrderPageContent />
    </Suspense>
  );
}
