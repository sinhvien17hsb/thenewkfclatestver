"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { feedbackData } from "@/lib/data/analytics";
import { formatTimeAgo } from "@/lib/utils";

const CRITERIA = [
  { key: "foodQuality", label: "Chất lượng món ăn", emoji: "🍗" },
  { key: "service", label: "Chất lượng dịch vụ", emoji: "👨‍💼" },
  { key: "cleanliness", label: "Vệ sinh cơ sở", emoji: "✨" },
  { key: "waitingTime", label: "Thời gian chờ", emoji: "⏱️" },
] as const;

export default function FeedbackPage() {
  const [ratings, setRatings] = useState({ foodQuality: 0, service: 0, cleanliness: 0, waitingTime: 0 });
  const [hoveredRatings, setHoveredRatings] = useState({ foodQuality: 0, service: 0, cleanliness: 0, waitingTime: 0 });
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (Object.values(ratings).some((r) => r === 0)) {
      toast.error("Vui lòng đánh giá tất cả các tiêu chí");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Cảm ơn bạn đã đánh giá!", { description: "Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ." });
  };

  const avgRating = Object.values(ratings).reduce((a, b) => a + b, 0) / 4;

  if (submitted) {
    return (
      <PageWrapper maxWidth="md">
        <div className="text-center py-16">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Cảm ơn bạn! 🙏</h2>
          <p className="text-gray-500 mb-2">Đánh giá của bạn đã được gửi thành công.</p>
          <p className="text-sm text-gray-400 mb-8">Điểm trung bình: <strong className="text-[#E4002B]">{avgRating.toFixed(1)}/5 ⭐</strong></p>
          <div className="flex gap-3 justify-center">
            <Link href="/customer/menu">
              <Button>Đặt thêm món</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Trang chủ</Button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper maxWidth="md">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customer/orders">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Đánh giá trải nghiệm</h1>
          <p className="text-sm text-gray-500">Ý kiến của bạn giúp KFC cải thiện</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Rating card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đánh giá theo tiêu chí</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {CRITERIA.map(({ key, label, emoji }) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="font-medium text-gray-900">{label}</span>
                  {ratings[key] > 0 && (
                    <span className="ml-auto text-sm font-bold text-[#E4002B]">
                      {ratings[key]}/5
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredRatings((h) => ({ ...h, [key]: star }))}
                      onMouseLeave={() => setHoveredRatings((h) => ({ ...h, [key]: 0 }))}
                      onClick={() => setRatings((r) => ({ ...r, [key]: star }))}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredRatings[key] || ratings[key])
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Comment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bình luận thêm (tùy chọn)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Chia sẻ cảm nhận của bạn về lần đến thăm này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-2">{comment.length}/500 ký tự</p>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting || Object.values(ratings).some((r) => r === 0)}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Đang gửi...
            </span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Gửi đánh giá
            </>
          )}
        </Button>
      </div>

      {/* Recent feedback */}
      <div className="mt-8">
        <h2 className="font-bold text-gray-900 mb-4">Phản hồi gần đây từ khách hàng</h2>
        <div className="space-y-3">
          {feedbackData.slice(0, 3).map((fb) => (
            <Card key={fb.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-medium text-sm text-gray-900">{fb.customerName}</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-3 w-3 ${s <= fb.ratings.foodQuality ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{fb.comment}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    fb.sentiment === "positive" ? "bg-green-100 text-green-700" :
                    fb.sentiment === "negative" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {fb.sentiment === "positive" ? "😊 Tích cực" : fb.sentiment === "negative" ? "😞 Tiêu cực" : "😐 Trung lập"}
                  </span>
                  <span className="text-xs text-gray-400">{formatTimeAgo(fb.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
