"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Bot, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

const QUICK_PROMPTS = [
  "What combos do you have?",
  "How do I track my order?",
  "Menu của KFC là gì?",
  "Cách đặt hàng như thế nào?",
];

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#E4002B] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kfc-logo.png" alt="KFC" className="w-5 h-5 object-contain rounded-full" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-[#E4002B] text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        {msg.text}
      </div>
    </motion.div>
  );
}

export function GeminiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Xin chào! 👋 Tôi là KFC Sync Assistant. Tôi có thể giúp bạn tìm hiểu thực đơn, cách đặt hàng, hoặc bất kỳ câu hỏi nào về KFC. Bạn cần giúp gì?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", text: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (e: unknown) {
      setMessages((prev) => [...prev, { role: "model", text: `⚠️ Lỗi: ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([{ role: "model", text: "Xin chào! 👋 Tôi là KFC Sync Assistant. Bạn cần giúp gì?" }]);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-[#E4002B] shadow-lg shadow-red-500/30 flex items-center justify-center hover:bg-[#BB0020] transition-colors"
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="fixed bottom-44 md:bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ height: "480px" }}
          >
            {/* Header */}
            <div className="bg-[#1A1A1A] px-4 py-3 flex items-center gap-3 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/kfc-logo.png" alt="KFC" className="w-8 h-8 object-contain rounded-full bg-white p-0.5" />
              <div className="flex-1">
                <div className="text-white font-bold text-sm">KFC Sync Assistant</div>
                <div className="text-green-400 text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Powered by Gemini AI
                </div>
              </div>
              <button onClick={reset} className="text-gray-400 hover:text-white transition-colors p-1" title="Reset chat">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
              {loading && (
                <div className="flex justify-start mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#E4002B] flex items-center justify-center mr-2 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/kfc-logo.png" alt="KFC" className="w-5 h-5 object-contain rounded-full" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts (only shown when just the greeting) */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs bg-red-50 text-[#E4002B] border border-red-200 rounded-full px-2.5 py-1 hover:bg-[#E4002B] hover:text-white transition-colors font-medium"
                  >
                    {p}
                  </button>
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
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E4002B] focus:ring-1 focus:ring-[#E4002B]/20 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-[#E4002B] text-white flex items-center justify-center hover:bg-[#BB0020] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
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
