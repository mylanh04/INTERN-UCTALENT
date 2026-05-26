import React, { useState } from 'react';
import { Search, Loader2, Sparkles, MapPin, Info } from 'lucide-react';

interface PlaceIdImporterProps {
  onImport: (placeId: string) => Promise<void>;
  isLoading: boolean;
}

export default function PlaceIdImporter({ onImport, isLoading }: PlaceIdImporterProps) {
  const [placeId, setPlaceId] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeId.trim() || isLoading) return;
    onImport(placeId.trim());
  };

  const handleQuickMock = (id: string) => {
    setPlaceId(id);
    onImport(id);
  };

  const mockHotels = [
    { name: "🏨 Hilton Hanoi", id: "mock-hanoi-opera" },
    { name: "🏢 Sheraton Saigon", id: "mock-saigon-sheraton" },
    { name: "🏖️ InterCon Da Nang", id: "mock-danang-resort" }
  ];

  return (
    <div className="w-full bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl relative">
      {/* Decorative top lighting edge */}
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Đồng bộ Đánh giá từ Google Maps</h2>
          </div>
          
          <div className="relative">
            <button
              type="button"
              className="text-slate-400 hover:text-white transition-colors p-1"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              aria-label="Thông tin Place ID"
            >
              <Info className="w-4 h-4" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-7 z-50 w-72 p-3.5 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl text-xs text-slate-300 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="font-semibold text-white mb-1.5 flex items-center">
                  <Sparkles className="w-3 h-3 text-indigo-400 mr-1" /> Cách lấy Google Place ID:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Tìm địa điểm của bạn trên Google Maps.</li>
                  <li>Xem URL trên thanh địa chỉ, tìm chuỗi có định dạng <code className="text-indigo-400 font-mono bg-slate-900 px-1 py-0.5 rounded">ChIJ...</code></li>
                  <li>Hoặc tìm kiếm "Google Place ID Finder" để tra cứu nhanh mã ID của bất kỳ địa điểm nào.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-indigo-500/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 shadow-inner group-hover:border-slate-700/60"
              placeholder="Nhập Google Maps Place ID (Ví dụ: ChIJN1t_tDeuEmsRUsoyG83dQY4...)"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!placeId.trim() || isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 shrink-0 border border-indigo-400/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang đồng bộ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Đồng bộ ngay</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1.5">
          <span className="text-xs font-semibold text-slate-500">Thử nhanh bản demo:</span>
          {mockHotels.map((hotel) => (
            <button
              key={hotel.id}
              type="button"
              onClick={() => handleQuickMock(hotel.id)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {hotel.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
