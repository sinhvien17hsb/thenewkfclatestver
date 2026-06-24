"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className="h-8 w-8"
              fill={(hover || value) >= star ? "#F59E0B" : "none"}
              stroke={(hover || value) >= star ? "#F59E0B" : "#D1D5DB"}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function FeedbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const tableNumber = searchParams.get("table");

  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [waitingRating, setWaitingRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!foodRating || !serviceRating || !waitingRating) {
      toast.error("Vui lòng đánh giá tất cả các tiêu chí.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, tableNumber, foodRating, serviceRating, waitingRating, comment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      setSubmitted(true);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Không thể gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Cảm ơn bạn! 🙏</h2>
          <p className="text-gray-500 mb-6">Đánh giá của bạn giúp chúng tôi phục vụ tốt hơn.</p>
          <Button onClick={() => router.push(`/order?table=${tableNumber ?? "01"}`)}>
            Đặt món thêm
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-[#1A1A1A] text-white px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="text-xs text-gray-400 mb-1">Đánh giá trải nghiệm</div>
          <div className="text-2xl font-black">Bạn thấy thế nào?</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
          <StarRating value={foodRating} onChange={setFoodRating} label="🍗 Chất lượng món ăn" />
          <StarRating value={serviceRating} onChange={setServiceRating} label="😊 Chất lượng phục vụ" />
          <StarRating value={waitingRating} onChange={setWaitingRating} label="⏱️ Thời gian chờ đợi" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm p-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Ý kiến thêm <span className="font-normal text-gray-400">(tùy chọn)</span>
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            className="resize-none border-gray-200 rounded-xl"
            rows={4}
          />
        </motion.div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 rounded-2xl text-base">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Gửi đánh giá
        </Button>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-[#E4002B] animate-spin" /></div>}>
      <FeedbackContent />
    </Suspense>
  );
}
