"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { translate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { feedbackData } from "@/lib/data/analytics";
import { formatTimeAgo } from "@/lib/utils";

const CRITERIA_KEYS = [
  { key: "foodQuality",  labelKey: "feedback_food"    as const, emoji: "🍗" },
  { key: "service",      labelKey: "feedback_service" as const, emoji: "👨‍💼" },
  { key: "cleanliness",  labelKey: "feedback_clean"   as const, emoji: "✨" },
  { key: "waitingTime",  labelKey: "feedback_wait"    as const, emoji: "⏱️" },
] as const;

export default function FeedbackPage() {
  const { language } = useAppStore();
  const tr = (key: Parameters<typeof translate>[0]) => translate(key, language);

  const [ratings, setRatings] = useState({ foodQuality: 0, service: 0, cleanliness: 0, waitingTime: 0 });
  const [hoveredRatings, setHoveredRatings] = useState({ foodQuality: 0, service: 0, cleanliness: 0, waitingTime: 0 });
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (Object.values(ratings).some((r) => r === 0)) {
      toast.error(tr("feedback_all_required"));
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    toast.success(tr("feedback_success"), { description: tr("feedback_success_d") });
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
          <h2 className="text-2xl font-black text-gray-900 mb-2">{tr("feedback_thanks")}</h2>
          <p className="text-gray-500 mb-2">{tr("feedback_thanks_sent")}</p>
          <p className="text-sm text-gray-400 mb-8">{tr("feedback_avg_score")}: <strong className="text-[#E4002B]">{avgRating.toFixed(1)}/5 ⭐</strong></p>
          <div className="flex gap-3 justify-center">
            <Link href="/customer/menu">
              <Button>{tr("feedback_order_more")}</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">{tr("feedback_home")}</Button>
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
          <h1 className="text-2xl font-black text-gray-900">{tr("feedback_title")}</h1>
          <p className="text-sm text-gray-500">{tr("feedback_subtitle")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tr("feedback_criteria")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {CRITERIA_KEYS.map(({ key, labelKey, emoji }) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="font-medium text-gray-900">{tr(labelKey)}</span>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tr("feedback_comment_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={tr("feedback_comment_ph")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-2">{comment.length}/500 {tr("feedback_chars")}</p>
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
              {tr("feedback_submitting")}
            </span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {tr("feedback_submit")}
            </>
          )}
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="font-bold text-gray-900 mb-4">{tr("feedback_recent")}</h2>
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
                    {fb.sentiment === "positive" ? (language === "en" ? "😊 Positive" : "😊 Tích cực") :
                     fb.sentiment === "negative" ? (language === "en" ? "😞 Negative" : "😞 Tiêu cực") :
                     (language === "en" ? "😐 Neutral" : "😐 Trung lập")}
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
