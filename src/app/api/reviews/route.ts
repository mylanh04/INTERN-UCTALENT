import { NextRequest, NextResponse } from 'next/server';
import { getReviews, saveReview, Review } from '@/lib/db';

// Quick realistic review generation function for fallback demo mode
function generateMockReviews(placeId: string): Review[] {
  let placeName = "Khách sạn Imperial";
  if (placeId.toLowerCase().includes("hanoi")) placeName = "Hilton Hanoi Opera";
  else if (placeId.toLowerCase().includes("saigon")) placeName = "Sheraton Saigon Hotel";
  else if (placeId.toLowerCase().includes("da-nang")) placeName = "InterContinental Da Nang";

  const authors = [
    { name: "Lê Minh Tuấn", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    { name: "Emily Watson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80" },
    { name: "Phạm Minh Hoàng", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
    { name: "Nguyễn Thảo Chi", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
    { name: "Kenji Sato", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80" }
  ];

  const reviewTemplates = [
    {
      rating: 5,
      text: `Dịch vụ tại ${placeName} trên cả tuyệt vời! Mình đặt phòng Suite cho gia đình, view nhìn ra phố cực đẹp. Nhân viên phục vụ rất nhiệt tình, chu đáo hỗ trợ mang hành lý và tư vấn nhiệt tình. Khách sạn sạch sẽ và thơm tho. Chắc chắn sẽ quay lại!`,
      time: "Vừa xong"
    },
    {
      rating: 4,
      text: `We had a pleasant stay at ${placeName}. The staff was incredibly helpful, especially the concierge who recommended great local restaurants. The breakfast buffet had plenty of options. The only downside was that the swimming pool area was a bit crowded during the afternoon.`,
      time: "10 phút trước"
    },
    {
      rating: 2,
      text: `Phòng ốc của ${placeName} khá cũ kỹ so với tầm giá. Hệ thống nước nóng lạnh trong phòng tắm hoạt động không ổn định, lúc quá nóng lúc lại lạnh ngắt. Đã báo kỹ thuật sửa nhưng vẫn không cải thiện được nhiều. Mong ban quản lý nâng cấp cơ sở vật chất.`,
      time: "1 giờ trước"
    },
    {
      rating: 5,
      text: `Highly recommend ${placeName}! Excellent location, very clean rooms, and outstanding service. The roof bar offers a stunning panoramic view of the city. Special thanks to the front desk team for making our anniversary trip so memorable with a surprise cake!`,
      time: "3 giờ trước"
    },
    {
      rating: 3,
      text: `Mức giá ở ${placeName} hơi cao so với chất lượng dịch vụ nhận được. Thủ tục check-out mất quá nhiều thời gian do hệ thống xuất hóa đơn gặp sự cố, làm tôi suýt nữa thì trễ chuyến bay. Phòng đẹp nhưng cách âm chưa tốt lắm, vẫn nghe tiếng ồn từ hành lang.`,
      time: "5 giờ trước"
    }
  ];

  return reviewTemplates.map((tmpl, idx) => {
    const author = authors[idx % authors.length];
    return {
      id: `rev-${placeId.substring(0, 5)}-${idx}-${Date.now()}`,
      placeId,
      author: author.name,
      avatar: author.avatar,
      rating: tmpl.rating,
      text: tmpl.text,
      time: tmpl.time,
      status: 'pending',
      createdAt: new Date(Date.now() - idx * 30 * 60 * 1000).toISOString()
    };
  });
}

export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { placeId } = body;

    if (!placeId) {
      return NextResponse.json({ success: false, error: "Missing placeId" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (apiKey && !placeId.startsWith("mock-")) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,name&key=${apiKey}&language=vi`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.result?.reviews) {
          const googleReviews = data.result.reviews;
          const savedReviews: Review[] = [];

          for (let idx = 0; idx < googleReviews.length; idx++) {
            const rev = googleReviews[idx];
            const formattedReview: Review = {
              id: `rev-google-${rev.time}-${idx}`,
              placeId,
              author: rev.author_name,
              avatar: rev.profile_photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
              rating: rev.rating,
              text: rev.text,
              time: rev.relative_time_description || "Vài ngày trước",
              status: 'pending',
              createdAt: new Date(rev.time * 1000).toISOString()
            };
            await saveReview(formattedReview);
            savedReviews.push(formattedReview);
          }

          return NextResponse.json({ success: true, isMock: false, reviews: savedReviews });
        } else {
          console.warn("Google Places API returned status:", data.status, "Falling back to mock reviews.");
        }
      } catch (apiError) {
        console.error("Failed to fetch Google Places details, falling back to mock reviews:", apiError);
      }
    }

    // Fallback: Generate mock reviews
    const mockReviews = generateMockReviews(placeId);
    for (const rev of mockReviews) {
      await saveReview(rev);
    }

    return NextResponse.json({ success: true, isMock: true, reviews: mockReviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
