import React from 'react';
import { MessageSquare, Clock, CheckCircle, Star } from 'lucide-react';

interface StatsDashboardProps {
  total: number;
  pending: number;
  resolved: number;
  averageRating: number;
}

export default function StatsDashboard({ total, pending, resolved, averageRating }: StatsDashboardProps) {
  // Render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative w-4 h-4 text-amber-400">
            <Star className="absolute top-0 left-0 w-4 h-4 text-gray-600" />
            <div className="absolute top-0 left-0 w-4 h-4 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-600" />);
      }
    }
    return stars;
  };

  const statCards = [
    {
      title: "Tổng số Đánh giá",
      value: total,
      description: "Được đồng bộ từ Google Maps",
      icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
      gradient: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20",
      glow: "group-hover:shadow-indigo-500/10"
    },
    {
      title: "Đang Chờ Duyệt",
      value: pending,
      description: "Yêu cầu phản hồi bằng AI",
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      gradient: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
      glow: "group-hover:shadow-amber-500/10"
    },
    {
      title: "Đã Hoàn Thành",
      value: resolved,
      description: "Đã duyệt & gửi phản hồi",
      icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
      gradient: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
      glow: "group-hover:shadow-emerald-500/10"
    },
    {
      title: "Điểm Đánh Giá TB",
      value: averageRating.toFixed(1),
      description: "Độ hài lòng của khách hàng",
      icon: <div className="flex space-x-0.5">{renderStars(averageRating)}</div>,
      gradient: "from-pink-500/10 to-rose-500/10 border-pink-500/20",
      glow: "group-hover:shadow-pink-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`group relative overflow-hidden rounded-2xl border bg-slate-900/60 backdrop-blur-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.glow} ${card.gradient}`}
        >
          {/* Subtle light leak effect */}
          <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-white/5 blur-2xl group-hover:scale-150 transition-transform duration-500" />
          
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">{card.title}</p>
              <h3 className="text-3xl font-bold tracking-tight text-white mt-2 group-hover:scale-105 origin-left transition-transform duration-300">
                {card.value}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-inner">
              {card.icon}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2.5 flex items-center font-medium">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}
