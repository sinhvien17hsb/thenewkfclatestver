"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Bot, RotateCcw, ChefHat, BarChart3 } from "lucide-react";

interface Message { role: "user" | "model"; text: string; }

/* ── Config per role ── */
type Role = "customer" | "staff" | "manager";

const CONFIG: Record<Role, {
  title: string; subtitle: string; greeting: string;
  accent: string; headerBg: string; bubbleUser: string;
  apiPath: string; icon: React.ElementType;
  quickPrompts: string[];
}> = {
  customer: {
    title: "The New KFC Assistant",
    subtitle: "Trợ lý thực đơn KFC",
    greeting: "Xin chào! 👋 Tôi là trợ lý KFC. Hôm nay bạn muốn ăn gì?",
    accent: "#E4002B", headerBg: "#1A1A1A", bubbleUser: "bg-[#E4002B]",
    apiPath: "/api/ai",
    icon: Bot,
    quickPrompts: ["Gợi ý món hôm nay", "Có combo nào rẻ không?", "Giao hàng bao nhiêu tiền?", "Món mới nhất là gì?"],
  },
  staff: {
    title: "KFC Staff Assistant",
    subtitle: "Hỗ trợ vận hành ca làm việc",
    greeting: "Chào nhân viên! 👋 Tôi có thể giúp bạn về quy trình chế biến, kiểm tra chất lượng và xử lý đơn hàng.",
    accent: "#F97316", headerBg: "#1C1208", bubbleUser: "bg-orange-500",
    apiPath: "/api/ai/staff",
    icon: ChefHat,
    quickPrompts: ["Quy trình chiên gà", "Tiêu chuẩn chất lượng", "Bao nhiêu đơn đang chờ?", "Quy trình vệ sinh ca"],
  },
  manager: {
    title: "KFC Manager Analytics",
    subtitle: "Phân tích kinh doanh thời gian thực",
    greeting: "Xin chào Quản lý! 📊 Tôi có thể phân tích doanh thu, sản phẩm bán chạy và hiệu suất hoạt động. Bạn muốn xem gì?",
    accent: "#8B5CF6", headerBg: "#0F0A1E", bubbleUser: "bg-purple-600",
    apiPath: "/api/ai/manager",
    icon: BarChart3,
    quickPrompts: ["Doanh thu hôm nay", "Sản phẩm bán chạy nhất", "Tình trạng đơn hàng", "Tóm tắt tổng quan"],
  },
};

function getRole(pathname: string): Role {
  if (pathname.startsWith("/manager")) return "manager";
  if (pathname.startsWith("/staff") || pathname.startsWith("/kitchen") || pathname.startsWith("/employee") || pathname.startsWith("/supervisor")) return "staff";
  return "customer";
}

function ChatBubble({ msg, bubbleUser }: { msg: Message; bubbleUser: string }) {
  const isUser = msg.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#E4002B] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kfc-logo.png" alt="KFC" className="w-5 h-5 object-contain rounded-full" />
        </div>
      )}
      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
        isUser ? `${bubbleUser} text-white rounded-br-sm` : "bg-gray-100 text-gray-800 rounded-bl-sm"
      }`}>
        {msg.text}
      </div>
    </motion.div>
  );
}

export function GeminiChat() {
  const pathname = usePathname();
  const role = getRole(pathname);
  const cfg = CONFIG[role];
  const Icon = cfg.icon;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "model", text: cfg.greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset chat when role changes (page navigation)
  useEffect(() => {
    setMessages([{ role: "model", text: cfg.greeting }]);
    setInput("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", text: trimmed }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch(cfg.apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (e: unknown) {
      setMessages((prev) => [...prev, { role: "model", text: `Xin lỗi, có lỗi xảy ra: ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setMessages([{ role: "model", text: cfg.greeting }]); setInput(""); };

  const buttonStyle = { backgroundColor: cfg.accent };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        style={buttonStyle}
        className="fixed bottom-24 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="h-6 w-6 text-white" /></motion.div>
            : <motion.div key="b" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Icon className="h-6 w-6 text-white" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="fixed bottom-44 md:bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col bg-white"
            style={{ height: "500px" }}
          >
            {/* Header */}
            <div style={{ backgroundColor: cfg.headerBg }} className="px-4 py-3 flex items-center gap-3 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/kfc-logo.png" alt="KFC" className="w-8 h-8 object-contain rounded-full bg-white p-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm truncate">{cfg.title}</div>
                <div className="text-[10px] flex items-center gap-1" style={{ color: cfg.accent }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: cfg.accent }} />
                  {cfg.subtitle}
                </div>
              </div>
              <button onClick={reset} className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Role badge */}
            <div className="px-3 pt-2 pb-0 flex-shrink-0">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: cfg.accent }}>
                {role === "manager" ? "MANAGER" : role === "staff" ? "STAFF / SUPERVISOR" : "CUSTOMER"}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {messages.map((msg, i) => <ChatBubble key={i} msg={msg} bubbleUser={cfg.bubbleUser} />)}
              {loading && (
                <div className="flex justify-start mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#E4002B] flex items-center justify-center mr-2 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/kfc-logo.png" alt="KFC" className="w-5 h-5 object-contain rounded-full" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                    {[0, 150, 300].map((d) => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
                {cfg.quickPrompts.map((p) => (
                  <button key={p} onClick={() => sendMessage(p)}
                    className="text-xs rounded-full px-2.5 py-1 font-medium transition-colors border text-white"
                    style={{ backgroundColor: cfg.accent, borderColor: cfg.accent }}
                  >{p}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Nhập tin nhắn..."
                disabled={loading}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 disabled:opacity-50 transition-colors"
                style={{ ["--tw-ring-color" as string]: cfg.accent }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={input.trim() && !loading ? buttonStyle : {}}
                className="w-9 h-9 rounded-xl text-white flex items-center justify-center disabled:opacity-40 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
