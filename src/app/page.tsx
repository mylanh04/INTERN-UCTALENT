'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Layers, Bell, CheckCircle, AlertCircle, X } from 'lucide-react';
import StatsDashboard from '@/components/StatsDashboard';
import PlaceIdImporter from '@/components/PlaceIdImporter';
import ReviewCard from '@/components/ReviewCard';
import { Review } from '@/lib/db';

interface Toast {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [toast, setToast] = useState<Toast>({ message: '', type: 'success', visible: false });

  // Fetch reviews on mount
  useEffect(() => {
    async function loadInitialReviews() {
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (err) {
        showToast("Không thể tải danh sách đánh giá từ máy chủ", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialReviews();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const handleImportPlaceId = async (placeId: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId })
      });
      const data = await res.json();
      if (data.success) {
        // Prepend new reviews to the state list
        setReviews(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const newUniqueReviews = data.reviews.filter((r: Review) => !existingIds.has(r.id));
          return [...newUniqueReviews, ...prev];
        });
        showToast(`Đồng bộ thành công ${data.reviews.length} đánh giá mới từ Google Maps!`, "success");
      } else {
        showToast(data.error || "Không thể đồng bộ đánh giá", "error");
      }
    } catch (err) {
      showToast("Lỗi mạng khi đồng bộ đánh giá", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateAI = async (reviewId: string) => {
    try {
      const res = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev =>
          prev.map(r => (r.id === reviewId ? { ...r, aiReplies: data.replies } : r))
        );
        showToast("Đã sinh 3 câu trả lời gợi ý bằng AI thành công!", "success");
      } else {
        showToast(data.error || "Không thể sinh câu trả lời AI", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi gửi yêu cầu AI", "error");
    }
  };

  const handleApprove = async (
    reviewId: string,
    replyText: string,
    tone: 'standard' | 'friendly' | 'problem_solving'
  ) => {
    try {
      const res = await fetch('/api/approve-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, replyText, tone })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev =>
          prev.map(r =>
            r.id === reviewId
              ? {
                  ...r,
                  status: 'resolved',
                  approvedReply: replyText,
                  approvedTone: tone
                }
              : r
          )
        );
        showToast("Phê duyệt phản hồi thành công và đã đóng hồ sơ!", "success");
      } else {
        showToast(data.error || "Không thể phê duyệt phản hồi", "error");
      }
    } catch (err) {
      showToast("Lỗi mạng khi phê duyệt phản hồi", "error");
    }
  };

  // Compute stats
  const total = reviews.length;
  const pending = reviews.filter(r => r.status === 'pending').length;
  const resolved = reviews.filter(r => r.status === 'resolved').length;
  const averageRating = total > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / total 
    : 0;

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'resolved') return r.status === 'resolved';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Decorative top lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 mb-8 border-b border-slate-850 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600/30 rounded-2xl blur-md animate-pulse" />
            <div className="relative bg-gradient-to-tr from-indigo-600 to-purple-600 p-3 rounded-2xl border border-indigo-400/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                UCOrm AI Dashboard
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full uppercase tracking-wider">
                MVP 0
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Nền tảng quản trị đánh giá và chăm sóc khách hàng tự động bằng AI thế hệ mới
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">Gemini 3.5 Engine Active</span>
          </div>
        </div>
      </header>

      {/* Stats Dashboard Section */}
      <section className="mb-8 relative z-10">
        <StatsDashboard
          total={total}
          pending={pending}
          resolved={resolved}
          averageRating={averageRating}
        />
      </section>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Left column - Places Syncer & Control info */}
        <div className="lg:col-span-1 space-y-6">
          <PlaceIdImporter onImport={handleImportPlaceId} isLoading={isSyncing} />
          
          <div className="rounded-2xl border border-slate-850 bg-slate-950/40 p-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-300">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold tracking-tight uppercase text-slate-350">Quy trình xử lý cốt lõi</h3>
            </div>
            <div className="relative pl-6 border-l border-slate-800 space-y-5 text-xs text-slate-400">
              <div className="relative">
                <span className="absolute -left-[30px] top-0 flex items-center justify-center w-[19px] h-[19px] bg-slate-900 border border-slate-700 rounded-full font-bold text-[9px] text-slate-300">1</span>
                <p className="font-bold text-slate-200">Nhập Place ID</p>
                <p className="text-slate-500 mt-0.5">Hệ thống đồng bộ dữ liệu đánh giá 5 sao từ Google Maps vào cơ sở dữ liệu nội bộ.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[30px] top-0 flex items-center justify-center w-[19px] h-[19px] bg-slate-900 border border-slate-700 rounded-full font-bold text-[9px] text-slate-300">2</span>
                <p className="font-bold text-slate-200">Sinh phản hồi AI</p>
                <p className="text-slate-500 mt-0.5">Gemini phân tích đánh giá để soạn 3 phương án phản hồi chất lượng theo 3 tông giọng riêng biệt.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[30px] top-0 flex items-center justify-center w-[19px] h-[19px] bg-slate-900 border border-slate-700 rounded-full font-bold text-[9px] text-slate-300">3</span>
                <p className="font-bold text-slate-200">Duyệt & Hoàn thành</p>
                <p className="text-slate-500 mt-0.5">Quản trị viên tinh chỉnh câu trả lời, phê duyệt bản ưng ý nhất và đóng hồ sơ xử lý.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {/* List Headers & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-white">Danh sách Ý kiến Khách hàng</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-450">
                {filteredReviews.length}
              </span>
            </div>
            
            <div className="flex bg-slate-950/70 p-0.5 rounded-xl border border-slate-850 self-start">
              {(['all', 'pending', 'resolved'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    filter === t
                      ? 'bg-slate-800 text-white shadow'
                      : 'text-slate-550 hover:text-slate-200'
                  }`}
                >
                  {t === 'all' && 'Tất cả'}
                  {t === 'pending' && `Chờ duyệt (${pending})`}
                  {t === 'resolved' && `Đã duyệt (${resolved})`}
                </button>
              ))}
            </div>
          </div>

          {/* List Rendering */}
          <div className="space-y-4 min-h-[400px]">
            {isLoading ? (
              // Initial Loading Skeleton Grid
              <div className="space-y-4">
                {[1, 2].map((idx) => (
                  <div key={idx} className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6 space-y-4 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 bg-slate-800 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-800 rounded w-1/4" />
                        <div className="h-3 bg-slate-800 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-16 bg-slate-800 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filteredReviews.length > 0 ? (
              <motion.div layout className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredReviews.map((rev) => (
                    <ReviewCard
                      key={rev.id}
                      review={rev}
                      onGenerateAI={handleGenerateAI}
                      onApprove={handleApprove}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              // Empty State
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 py-16 px-4 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
                  <Layers className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-slate-300 font-bold tracking-tight text-sm">Không tìm thấy đánh giá nào</h4>
                  <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                    {filter === 'all'
                      ? "Hãy nhập Google Maps Place ID ở cột bên trái và bấm Đồng bộ để tải dữ liệu."
                      : filter === 'pending'
                      ? "Tuyệt vời! Không còn đánh giá nào đang chờ phê duyệt phản hồi."
                      : "Chưa có đánh giá nào được phê duyệt thành công."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Premium Toast Notifications */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-950/95 border rounded-2xl shadow-2xl p-4 flex items-start space-x-3 backdrop-blur-md"
            style={{
              borderColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              boxShadow: toast.type === 'success' ? '0 10px 30px -10px rgba(16, 185, 129, 0.2)' : '0 10px 30px -10px rgba(239, 68, 68, 0.2)'
            }}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center">
                <Bell className="w-3.5 h-3.5 mr-1 text-slate-400" /> Hệ thống thông báo
              </p>
              <p className="text-xs text-slate-350 leading-relaxed mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(prev => ({ ...prev, visible: false }))}
              className="text-slate-500 hover:text-slate-300 p-0.5 shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
