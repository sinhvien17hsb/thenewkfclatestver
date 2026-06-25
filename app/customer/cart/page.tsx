"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, QrCode, MapPin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { translate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, clearCart, addCustomerOrder, tableNumber, setTableNumber, language } = useAppStore();
  const tr = (key: Parameters<typeof translate>[0]) => translate(key, language);
  const [customerName, setCustomerName] = useState("");
  const [tableInput, setTableInput] = useState(tableNumber?.toString() ?? "");
  const [isPlacing, setIsPlacing] = useState(false);
  const router = useRouter();
  const total = cartTotal();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const tbl = tableInput ? parseInt(tableInput) : undefined;
    if (!tbl) { toast.error("Vui lòng nhập số bàn."); return; }
    setTableNumber(tbl);
    setIsPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: tbl,
          customerName: customerName || "Khách hàng",
          items: cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity, notes: c.notes })),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Đặt hàng thất bại.");
      }
      const order = await res.json();
      addCustomerOrder({
        id: order.id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        status: order.status,
        totalAmount: order.totalAmount,
        estimatedTime: order.estimatedTime,
        createdAt: order.createdAt,
        items: order.items.map((i: { quantity: number; price: number; menuItem: { name: string } }) => ({
          name: i.menuItem.name,
          quantity: i.quantity,
          price: i.price,
        })),
      });
      clearCart();
      toast.success("Đặt hàng thành công!", {
        description: `Mã đơn: ${order.orderNumber} · Bàn ${tbl}`,
        duration: 4000,
      });
      router.push("/customer/orders");
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setIsPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <PageWrapper maxWidth="2xl">
        <div className="text-center py-20">
          <div className="text-8xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{tr("cart_empty")}</h2>
          <p className="text-gray-500 mb-6">{tr("cart_empty_desc")}</p>
          <Link href="/customer/menu">
            <Button size="lg">{tr("cart_view_menu")}</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper maxWidth="2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customer/menu">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{tr("cart_title")}</h1>
          <p className="text-sm text-gray-500">{cart.length} {tr("cart_types")}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-3">
          <AnimatePresence>
            {cart.map(({ menuItem, quantity }) => (
              <motion.div
                key={menuItem.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl flex-shrink-0">{menuItem.image}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{menuItem.name}</p>
                        <p className="text-[#E4002B] font-bold mt-0.5">{formatCurrency(menuItem.price)}</p>
                        <p className="text-xs text-gray-400">⏱ {menuItem.prepTime} phút chuẩn bị</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => quantity === 1 ? removeFromCart(menuItem.id) : updateCartQuantity(menuItem.id, quantity - 1)}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#E4002B] hover:text-[#E4002B] transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-bold">{quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(menuItem.id, quantity + 1)}
                          className="w-8 h-8 rounded-full bg-[#E4002B] text-white flex items-center justify-center hover:bg-[#BB0020] transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => { removeFromCart(menuItem.id); toast.info(`Đã xóa ${menuItem.name}`, { duration: 2000 }); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-end mt-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {formatCurrency(menuItem.price * quantity)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#E4002B]" /> {tr("cart_table_info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{tr("cart_table_num")}</label>
                <Input
                  type="number"
                  placeholder={tr("cart_table_ph")}
                  value={tableInput}
                  onChange={(e) => setTableInput(e.target.value)}
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{tr("cart_name_label")}</label>
                <Input
                  placeholder={tr("cart_name_ph")}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 rounded-lg p-2.5">
                <QrCode className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span>{tr("cart_qr")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#E4002B]" /> {tr("cart_summary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.map(({ menuItem, quantity }) => (
                <div key={menuItem.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 flex-1 mr-2">{menuItem.name} × {quantity}</span>
                  <span className="font-medium text-gray-900 flex-shrink-0">{formatCurrency(menuItem.price * quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{tr("cart_subtotal")}</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{tr("cart_fee")}</span>
                <Badge variant="secondary" className="text-xs">{tr("cart_free")}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">{tr("cart_total")}</span>
                <span className="font-black text-xl text-[#E4002B]">{formatCurrency(total)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isPlacing || cart.length === 0}
              >
                {isPlacing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {tr("cart_processing")}
                  </span>
                ) : (
                  `${tr("cart_place_order")} · ${formatCurrency(total)}`
                )}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                {tr("cart_note")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
