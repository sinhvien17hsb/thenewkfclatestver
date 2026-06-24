"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Search, ToggleLeft, ToggleRight, X } from "lucide-react";
import { toast } from "sonner";
import { usePolling } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MenuItem { id: string; name: string; description: string; category: string; price: number; imageEmoji: string; available: boolean; }

const CATEGORIES = ["Gà rán", "Burger", "Combo", "Sides", "Drinks", "Desserts"];
const EMOJIS = ["🍗","🍔","🌮","🍟","🥤","🍦","🥗","🍱","🌯","🍞","🥩","🎉"];

function MenuForm({ item, onSave, onClose }: {
  item?: MenuItem; onSave: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name ?? "", description: item?.description ?? "", category: item?.category ?? "",
    price: item?.price ?? 0, imageEmoji: item?.imageEmoji ?? "🍗", available: item?.available ?? true,
  });
  const [loading, setLoading] = useState(false);

  const s = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || form.price <= 0) { toast.error("Vui lòng điền đầy đủ."); return; }
    setLoading(true);
    try {
      const url = item ? `/api/menu/${item.id}` : "/api/menu";
      const method = item ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success(item ? "Đã cập nhật!" : "Đã thêm món!");
      onSave();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-black text-white">{item ? "Sửa món" : "Thêm món mới"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button type="button" key={e} onClick={() => s("imageEmoji", e)}
                  className={`text-xl p-1.5 rounded-lg transition-all ${form.imageEmoji === e ? "bg-[#E4002B]/30 ring-2 ring-[#E4002B]" : "hover:bg-gray-800"}`}
                >{e}</button>
              ))}
              <input value={form.imageEmoji} onChange={(ev) => s("imageEmoji", ev.target.value)}
                placeholder="hoặc nhập..." maxLength={2}
                className="w-20 bg-gray-800 border border-gray-700 text-white rounded-lg px-2 text-center text-sm"
              />
            </div>
          </div>

          {[
            { k: "name", label: "Tên món", placeholder: "Gà rán giòn" },
            { k: "description", label: "Mô tả", placeholder: "Miêu tả ngắn..." },
          ].map(({ k, label, placeholder }) => (
            <div key={k}>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">{label}</label>
              <Input value={String(form[k as keyof typeof form])} onChange={(e) => s(k, e.target.value)}
                placeholder={placeholder}
                className="bg-gray-800 border-gray-700 text-white rounded-xl" />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Danh mục</label>
              <select value={form.category} onChange={(e) => s("category", e.target.value)}
                className="w-full h-9 rounded-xl border border-gray-700 px-3 text-sm bg-gray-800 text-white focus:outline-none"
              >
                <option value="">-- Chọn --</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Giá (VND)</label>
              <Input type="number" value={form.price} onChange={(e) => s("price", Number(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white rounded-xl" />
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-white">Có sẵn</span>
            <button type="button" onClick={() => s("available", !form.available)}>
              {form.available
                ? <ToggleRight className="h-6 w-6 text-green-400" />
                : <ToggleLeft className="h-6 w-6 text-gray-500" />}
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-700 text-gray-300">
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {item ? "Lưu" : "Thêm"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function MenuPage() {
  const { data: items, refetch } = usePolling<MenuItem[]>("/api/menu", 0);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [editing, setEditing] = useState<MenuItem | undefined>();
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = (items ?? []).filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || m.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa món này?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Đã xóa!");
      refetch();
    } catch {
      toast.error("Không thể xóa.");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (item: MenuItem) => {
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !item.available }),
      });
      refetch();
    } catch {
      toast.error("Không thể cập nhật.");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-white">Quản lý thực đơn</h1>
          <p className="text-gray-500 text-xs mt-0.5">{items?.length ?? 0} món</p>
        </div>
        <Button onClick={() => setAdding(true)} className="flex items-center gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" /> Thêm món
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm món..."
            className="bg-gray-900 border-gray-800 text-white pl-9 rounded-xl" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="h-9 rounded-xl border border-gray-800 px-3 text-sm bg-gray-900 text-white focus:outline-none"
        >
          <option value="">Tất cả danh mục</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-base font-semibold">{items?.length === 0 ? "Chưa có món nào" : "Không tìm thấy"}</p>
          {items?.length === 0 && (
            <p className="text-sm mt-1">Nhấn "Thêm món" để bắt đầu xây dựng thực đơn.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`bg-gray-900 rounded-2xl border border-gray-800 p-3.5 flex items-center gap-3 ${!item.available ? "opacity-60" : ""}`}
              >
                <span className="text-2xl flex-shrink-0">{item.imageEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md">{item.category}</span>
                    {!item.available && <span className="text-[10px] bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded-md">Hết</span>}
                  </div>
                  <div className="text-sm text-[#E4002B] font-bold mt-0.5">{formatCurrency(item.price)}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleToggle(item)} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    {item.available
                      ? <ToggleRight className="h-4 w-4 text-green-400" />
                      : <ToggleLeft className="h-4 w-4 text-gray-500" />}
                  </button>
                  <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                    className="p-1.5 rounded-lg hover:bg-red-950/40 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    {deleting === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {(adding || editing) && (
        <MenuForm
          item={editing}
          onSave={() => { refetch(); setAdding(false); setEditing(undefined); }}
          onClose={() => { setAdding(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}
