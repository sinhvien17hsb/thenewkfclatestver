"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowUpCircle, ArrowDownCircle, Loader2, AlertCircle, X, Package } from "lucide-react";
import { toast } from "sonner";
import { usePolling } from "@/lib/hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InventoryItem { id: string; name: string; unit: string; currentStock: number; minimumStock: number; }

function AddItemModal({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", unit: "kg", currentStock: 0, minimumStock: 0 });
  const [loading, setLoading] = useState(false);
  const s = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Nhập tên nguyên liệu."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success("Đã thêm!"); onSave();
    } catch (e: unknown) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-sm"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-black text-white">Thêm nguyên liệu</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Tên nguyên liệu</label>
            <Input value={form.name} onChange={(e) => s("name", e.target.value)} placeholder="Bột mì, Dầu ăn..."
              className="bg-gray-800 border-gray-700 text-white rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Đơn vị</label>
              <select value={form.unit} onChange={(e) => s("unit", e.target.value)}
                className="w-full h-9 rounded-xl border border-gray-700 px-2 text-sm bg-gray-800 text-white"
              >
                {["kg", "lít", "cái", "hộp", "túi", "chai"].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Hiện có</label>
              <Input type="number" value={form.currentStock} onChange={(e) => s("currentStock", Number(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Tối thiểu</label>
              <Input type="number" value={form.minimumStock} onChange={(e) => s("minimumStock", Number(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-700 text-gray-300">Hủy</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Thêm
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function TransactionModal({ item, onSave, onClose }: { item: InventoryItem; onSave: () => void; onClose: () => void }) {
  const [type, setType] = useState<"ADD" | "REMOVE" | "ADJUST">("ADD");
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) { toast.error("Nhập số lượng > 0."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/${item.id}/transaction`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, quantity, note }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success("Đã cập nhật kho!"); onSave();
    } catch (e: unknown) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-sm"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-black text-white">{item.name}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(["ADD", "REMOVE", "ADJUST"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`py-2 rounded-xl text-xs font-bold transition-colors ${type === t ? "bg-[#E4002B] text-white" : "bg-gray-800 text-gray-400"}`}
              >
                {t === "ADD" ? "Nhập" : t === "REMOVE" ? "Xuất" : "Điều chỉnh"}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">
              Số lượng ({item.unit}) · Hiện có: {item.currentStock}
            </label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Ghi chú</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Lý do..."
              className="bg-gray-800 border-gray-700 text-white rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-700 text-gray-300">Hủy</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Xác nhận
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function InventoryPage() {
  const { data: items, refetch } = usePolling<InventoryItem[]>("/api/inventory", 0);
  const [adding, setAdding] = useState(false);
  const [transacting, setTransacting] = useState<InventoryItem | null>(null);

  const lowStock = (items ?? []).filter((i) => i.currentStock <= i.minimumStock);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-white">Kho hàng</h1>
          <p className="text-gray-500 text-xs mt-0.5">{items?.length ?? 0} nguyên liệu</p>
        </div>
        <Button onClick={() => setAdding(true)} className="flex items-center gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" /> Thêm
        </Button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-950/40 border border-red-900 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-300">{lowStock.length} nguyên liệu sắp hết: {lowStock.map((i) => i.name).join(", ")}</span>
        </div>
      )}

      {(items ?? []).length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Package className="h-12 w-12 mx-auto mb-3" />
          <p className="font-semibold">Chưa có nguyên liệu nào</p>
          <p className="text-sm mt-1">Nhấn "Thêm" để bắt đầu theo dõi kho.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {(items ?? []).map((item) => {
              const isLow = item.currentStock <= item.minimumStock;
              const pct = item.minimumStock > 0 ? Math.min(100, (item.currentStock / (item.minimumStock * 3)) * 100) : 100;
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`bg-gray-900 rounded-2xl border p-4 ${isLow ? "border-red-900" : "border-gray-800"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {item.name}
                        {isLow && <span className="text-[10px] bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded-md">Sắp hết</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.currentStock} {item.unit} · Tối thiểu: {item.minimumStock} {item.unit}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setTransacting(item)}
                        className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1.5 rounded-xl transition-colors"
                      >
                        <ArrowUpCircle className="h-3.5 w-3.5 text-green-400" />
                        <ArrowDownCircle className="h-3.5 w-3.5 text-red-400" />
                        Cập nhật
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isLow ? "bg-red-500" : pct > 60 ? "bg-green-500" : "bg-yellow-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {adding && <AddItemModal onSave={() => { refetch(); setAdding(false); }} onClose={() => setAdding(false)} />}
      {transacting && <TransactionModal item={transacting} onSave={() => { refetch(); setTransacting(null); }} onClose={() => setTransacting(null)} />}
    </div>
  );
}
