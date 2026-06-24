"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message { role: "user" | "assistant"; content: string; }

const QUICK_PROMPTS = [
  "Hôm nay nên đặt món gì?",
  "Gợi ý combo cho gia đình 4 người",
  "Món nào phù hợp cho trẻ em?",
  "Có món nào chay không?",
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? "bg-[#E4002B]" : "bg-gray-700"}`}>
        {isUser ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser ? "bg-[#E4002B] text-white rounded-br-sm" : "bg-gray-800 text-gray-100 rounded-bl-sm"
      }`}>
        {msg.content}
      </div>
    </motion.div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Xin chào! Tôi là trợ lý AI của KFC. Tôi có thể giúp bạn chọn món, giới thiệu combo và trả lời câu hỏi về thực đơn. Bạn muốn ăn gì hôm nay? 🍗" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Lỗi không xác định");
      }
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.response }]);
    } catch (e: unknown) {
      setMessages([...newMessages, { role: "assistant", content: `Xin lỗi, đã có lỗi xảy ra: ${(e as Error).message}. Vui lòng thử lại.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E4002B] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-black text-base leading-none">Trợ lý AI</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-none">Powered by Gemini</div>
            </div>
          </div>
          <button
            onClick={() => setMessages([{ role: "assistant", content: "Xin chào! Tôi là trợ lý AI của KFC. Bạn muốn ăn gì hôm nay? 🍗" }])}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto pb-32">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Quick prompts (only show when no conversation) */}
          {messages.length <= 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_PROMPTS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Nhắn tin với trợ lý AI..."
              className="flex-1 rounded-2xl border-gray-200 text-sm"
              disabled={loading}
            />
            <Button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="rounded-2xl px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
