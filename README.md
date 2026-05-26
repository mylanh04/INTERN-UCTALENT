# 🌟 UCOrm AI Dashboard — Nền tảng quản trị đánh giá tự động bằng AI

**UCOrm AI Dashboard** (UC Online Reputation Management) là một nền tảng quản trị đánh giá và chăm sóc khách hàng tự động thế hệ mới, được thiết kế dưới dạng ứng dụng web hiện đại (Next.js & React 19). Hệ thống hỗ trợ đồng bộ hóa các đánh giá của khách hàng từ Google Maps và tự động soạn thảo các phản hồi thông minh dựa trên công nghệ AI của Google Gemini.

---

## ✨ Các tính năng nổi bật

- 📥 **Đồng bộ hóa Google Maps (Place ID Importer):** Nhập Google Maps Place ID để đồng bộ nhanh chóng các đánh giá thực tế từ người dùng. Hỗ trợ cơ chế tự động giả lập (Mock) khi chưa cấu hình API Key.
- 🤖 **Soạn phản hồi tự động bằng AI (Gemini 2.5/3.5):** Phân tích nội dung và xếp hạng đánh giá của khách hàng để tạo ra **03 phương án phản hồi** theo 3 phong cách khác nhau:
  1. **Standard (Tiêu chuẩn):** Lịch sự, chuyên nghiệp, đúng chuẩn mực dịch vụ.
  2. **Friendly (Thân thiện):** Ấm áp, vui vẻ, hiếu khách, gần gũi.
  3. **Problem Solving (Khắc phục lỗi):** Đồng cảm sâu sắc, nhận lỗi chân thành (với các đánh giá dưới 4 sao) và đề xuất giải pháp xử lý cụ thể.
- 📋 **Bảng điều khiển Quản trị (Admin Review Management):** Xem danh sách ý kiến khách hàng dưới dạng thẻ trực quan, bộ lọc thông minh (Tất cả, Chờ duyệt, Đã duyệt), hỗ trợ xem trước và tinh chỉnh câu trả lời trước khi phê duyệt.
- 📊 **Thống kê tổng quan (Stats Dashboard):** Theo dõi số lượng đánh giá, điểm đánh giá trung bình, số lượng hồ sơ đã hoàn thành hoặc đang chờ xử lý.
- 💾 **Cơ chế Lưu trữ Lai linh hoạt (Hybrid Database Storage):**
  - **Cloud Mode:** Tự động kết nối cơ sở dữ liệu Supabase PostgreSQL khi phát hiện các khóa cấu hình.
  - **Local Offline Mode:** Tự động lưu trữ và đồng bộ hóa cục bộ tại file `src/data/db.json` khi chạy offline.
- 🎨 **Giao diện Premium tối giản & mượt mà:** Thiết kế sang trọng với chế độ tối (Dark Mode), hiệu ứng chuyển động mượt mà (Framer Motion) và bộ biểu tượng sắc nét từ Lucide React.

---

## 🛠️ Công nghệ sử dụng

- **Core Framework:** [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS v4 & PostCSS
- **AI Engine:** Google Generative AI SDK (`@google/generative-ai`)
- **Database:** Supabase Client (`@supabase/supabase-js`) & Local File System fallback
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## 📂 Cấu trúc thư mục dự án

```text
InternUCTalent/
├── src/
│   ├── app/                # Next.js App Router (Layouts, Pages & API Routes)
│   │   ├── api/            # API Endpoints (reviews, generate-reply, approve-reply)
│   │   ├── globals.css     # Cấu hình styles toàn cục
│   │   ├── layout.tsx      # Bố cục giao diện chung
│   │   └── page.tsx        # Trang chủ Dashboard chính
│   ├── components/         # Các thành phần giao diện tái sử dụng
│   │   ├── PlaceIdImporter.tsx  # Thành phần đồng bộ Place ID Google Maps
│   │   ├── ReviewCard.tsx       # Thẻ hiển thị đánh giá và quản lý câu trả lời AI
│   │   └── StatsDashboard.tsx   # Thống kê tổng số đánh giá & điểm trung bình
│   ├── data/
│   │   └── db.json         # Cơ sở dữ liệu offline cục bộ
│   └── lib/
│       └── db.ts           # Xử lý kết nối database (Supabase & JSON Fallback)
├── .env.local              # File cấu hình biến môi trường (cần tạo mới)
├── package.json            # Quản lý thư viện và scripts chạy dự án
└── tsconfig.json           # Cấu hình TypeScript
```

---

## 🚀 Hướng dẫn cài đặt và khởi chạy

### 1. Tải các thư viện phụ thuộc
Khởi chạy terminal tại thư mục gốc của dự án và chạy lệnh sau để cài đặt các package cần thiết:
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` ở thư mục gốc của dự án và khai báo các thông tin sau:
```env
# Google Gemini API (Bắt buộc để tạo phản hồi AI)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Places API Key (Không bắt buộc, dùng để đồng bộ thật từ Google Maps)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Cấu hình Supabase (Không bắt buộc, nếu không có sẽ tự động lưu xuống db.json cục bộ)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Khởi chạy dự án ở chế độ phát triển
Chạy lệnh sau để khởi động máy chủ thử nghiệm:
```bash
npm run dev
```
Sau đó, mở trình duyệt và truy cập địa chỉ [http://localhost:3000](http://localhost:3000).

### 4. Biên dịch bản sản xuất (Production Build)
Để tối ưu và đóng gói ứng dụng khi triển khai thực tế:
```bash
npm run build
npm run start
```

---

## 🔄 Quy trình xử lý cốt lõi của hệ thống

1. **Bước 1: Nhập Google Maps Place ID**
   - Quản trị viên nhập mã địa điểm (Place ID) từ Google Maps.
   - Hệ thống tải dữ liệu đánh giá 5 sao về máy.
2. **Bước 2: Phân tích & Sinh phản hồi tự động**
   - Bấm vào nút AI trên mỗi đánh giá để kích hoạt Gemini AI.
   - AI phân tích ngữ cảnh, số sao, và tạo 3 phản hồi phù hợp với các phong cách dịch vụ khác nhau.
3. **Bước 3: Xem duyệt & Phê duyệt**
   - Quản trị viên xem trước 3 phương án phản hồi, chỉnh sửa trực tiếp nội dung nếu cần.
   - Bấm duyệt phương án phù hợp nhất để đóng hồ sơ xử lý cho đánh giá đó.
