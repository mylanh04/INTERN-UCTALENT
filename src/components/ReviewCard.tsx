import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Check, Edit3, MessageSquare, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { Review, AIReplies } from '@/lib/db';

interface ReviewCardProps {
  review: Review;
  onGenerateAI: (reviewId: string) => Promise<void>;
  onApprove: (reviewId: string, replyText: string, tone: 'standard' | 'friendly' | 'problem_solving') => Promise<void>;
}

export default function ReviewCard({ review, onGenerateAI, onApprove }: ReviewCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'standard' | 'friendly' | 'problem_solving'>('standard');
  const [editedReplies, setEditedReplies] = useState<AIReplies | null>(null);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Initialize edited replies when they are loaded
  React.useEffect(() => {
    if (review.aiReplies) {
      setEditedReplies({ ...review.aiReplies });
    }
  }, [review.aiReplies]);

  // Animation cycle for AI generation steps
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 3);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    try {
      await onGenerateAI(review.id);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveClick = async () => {
    if (!editedReplies) return;
    setIsApproving(true);
    try {
      await onApprove(review.id, editedReplies[selectedTone], selectedTone);
    } finally {
      setIsApproving(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editedReplies) return;
    setEditedReplies({
      ...editedReplies,
      [selectedTone]: e.target.value
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
        }`}
      />
    ));
  };

  const isLongText = review.text.length > 180;
  const displayText = isLongText && !isTextExpanded
    ? `${review.text.substring(0, 180)}...`
    : review.text;

  const steps = [
    "Đang phân tích nội dung đánh giá...",
    "Đang phân tích cảm xúc & chấm điểm hài lòng...",
    "Đang cá nhân hóa & soạn thảo 3 phản hồi cao cấp..."
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border bg-slate-900/40 backdrop-blur-xl p-5 md:p-6 transition-all duration-300 ${
        review.status === 'resolved'
          ? 'border-emerald-500/20 hover:border-emerald-500/35 bg-gradient-to-br from-slate-900/40 to-emerald-950/5'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Decorative colored glow on card borders */}
      {review.status === 'resolved' && (
        <div className="absolute top-0 right-10 w-24 h-[1px] bg-emerald-500/40 blur-xs" />
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-850">
        <div className="flex items-center space-x-3.5">
          <img
            src={review.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
            alt={review.author}
            className="w-11 h-11 rounded-full border border-slate-700 object-cover shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
            }}
          />
          <div>
            <h4 className="font-semibold text-slate-100 tracking-tight text-base">{review.author}</h4>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="flex space-x-0.5">{renderStars(review.rating)}</div>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-500 text-xs font-medium">{review.time}</span>
            </div>
          </div>
        </div>

        <div>
          {review.status === 'resolved' ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <Check className="w-3.5 h-3.5 mr-1" /> Đã Duyệt
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 animate-pulse" /> Đang Chờ
            </span>
          )}
        </div>
      </div>

      {/* Review Text Body */}
      <div className="py-4">
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line break-words">
          {displayText}
        </p>
        {isLongText && (
          <button
            onClick={() => setIsTextExpanded(!isTextExpanded)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors mt-2"
          >
            {isTextExpanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>

      {/* AI Reply Flow */}
      <div className="mt-2 border-t border-slate-850/70 pt-4">
        <AnimatePresence mode="wait">
          {review.status === 'resolved' ? (
            /* Resolved State - Display Approved Answer */
            <motion.div
              key="resolved-panel"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl bg-slate-950/65 border border-slate-850 p-4 relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Phản hồi đã chọn
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                  {review.approvedTone === 'standard' && 'Tiêu chuẩn'}
                  {review.approvedTone === 'friendly' && 'Thân thiện'}
                  {review.approvedTone === 'problem_solving' && 'Khắc phục lỗi'}
                </span>
              </div>
              <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-line bg-slate-900/40 p-3 rounded-lg border border-slate-850/60">
                {review.approvedReply}
              </p>
            </motion.div>
          ) : isGenerating ? (
            /* Generating AI State */
            <motion.div
              key="generating-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-6 flex flex-col items-center justify-center space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md animate-pulse" />
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin relative" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-indigo-300 animate-pulse">{steps[loadingStep]}</p>
                <p className="text-xs text-slate-500 mt-1">Cơ chế Gemini AI đang biên soạn nội dung chất lượng cao...</p>
              </div>
              
              {/* Skeleton Cards Animation */}
              <div className="w-full flex space-x-2 pt-2 opacity-40">
                <div className="h-2 bg-slate-800 rounded-full flex-1 animate-pulse" />
                <div className="h-2 bg-slate-800 rounded-full flex-1 animate-pulse delay-75" />
                <div className="h-2 bg-slate-800 rounded-full flex-1 animate-pulse delay-150" />
              </div>
            </motion.div>
          ) : review.aiReplies && editedReplies ? (
            /* AI Generated Options Ready */
            <motion.div
              key="replies-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col space-y-4"
            >
              {/* Tabs */}
              <div className="flex flex-wrap bg-slate-950/80 p-1 rounded-xl border border-slate-850">
                {(['standard', 'friendly', 'problem_solving'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                      selectedTone === tone
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tone === 'standard' && '👔 Tiêu chuẩn'}
                    {tone === 'friendly' && '😊 Thân thiện'}
                    {tone === 'problem_solving' && '🛠️ Khắc phục lỗi'}
                  </button>
                ))}
              </div>

              {/* Reply Content Editor */}
              <div className="relative group">
                <div className="absolute top-2.5 right-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors flex items-center space-x-1 pointer-events-none">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium hidden sm:inline">Chỉnh sửa</span>
                </div>
                <textarea
                  rows={4}
                  value={editedReplies[selectedTone]}
                  onChange={handleTextChange}
                  className="w-full bg-slate-950/70 border border-slate-850 focus:border-indigo-500/80 rounded-xl p-3.5 pr-20 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all leading-relaxed shadow-inner"
                  placeholder="Soạn câu trả lời..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={isApproving}
                  className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold p-1 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Viết lại bằng AI khác</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleApproveClick}
                  disabled={isApproving || !editedReplies[selectedTone]?.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center space-x-1.5 border border-emerald-500/20"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang phê duyệt...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Duyệt & Đóng</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            /* Idle Pending State - Needs Prompt to Generate */
            <motion.div
              key="idle-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-4 p-1.5"
            >
              <div className="flex items-center space-x-2 text-slate-400">
                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs text-slate-400">Đánh giá này chưa được phản hồi.</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateClick}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600/90 text-slate-200 hover:text-white text-xs font-bold transition-all duration-300 shadow-md hover:shadow-indigo-500/10 border border-slate-750 hover:border-indigo-500/30 flex items-center space-x-1.5 shrink-0 group active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white transition-colors group-hover:animate-pulse" />
                <span>Sinh phản hồi AI</span>
                <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
