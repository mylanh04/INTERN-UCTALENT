import { NextRequest, NextResponse } from 'next/server';
import { getReviewById, saveReview, Review } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Offline fallback mock AI reply generator
function generateMockAIReplies(author: string, rating: number, text: string): { standard: string, friendly: string, problem_solving: string } {
  const isEnglish = /[a-zA-Z\s]{40,}/.test(text) && !/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(text);

  if (isEnglish) {
    if (rating >= 4) {
      return {
        standard: `Dear ${author},\n\nThank you for sharing your wonderful experience with us. We are thrilled to hear that you had a pleasant stay and that our staff was helpful. We appreciate your valuable feedback regarding the pool area, and we will take it into consideration. We hope to welcome you back soon.\n\nBest regards,\nGuest Relations Manager`,
        friendly: `Hi ${author}!\n\nThanks a million for the awesome review! 🌟 We're so happy you loved your stay and enjoyed our hospitality. The team will be delighted to hear your praise! Next time you visit, make sure to try our rooftop bar. Can't wait to see you again soon!\n\nWarmly,\nThe Hotel Team`,
        problem_solving: `Dear ${author},\n\nThank you for staying with us and for your review. We are glad you enjoyed our rooms and hospitality. We sincerely apologize for the crowd at the swimming pool during the peak afternoon hours. We are currently reviewing our pool capacity guidelines to ensure a more relaxing experience for all guests. We hope to have the opportunity to provide you with a perfect stay next time.\n\nSincerely,\nGuest Services Team`
      };
    } else {
      return {
        standard: `Dear ${author},\n\nThank you for taking the time to share your feedback. We sincerely apologize for the slow check-in process and the weak Wi-Fi signal in your room. We strive to provide excellent service and we are disappointed that we fell short in these areas. Your comments have been shared with our IT and Front Desk teams to implement immediate improvements. We hope to welcome you back to show you our progress.\n\nSincerely,\nHotel Management`,
        friendly: `Hi ${author},\n\nThank you for letting us know about your stay. We're truly sorry that the check-in took so long and the Wi-Fi wasn't up to par. We love making our guests happy, and we clearly missed the mark this time. We've already got our tech team checking the routers on the 12th floor! We'd love to make this up to you on your next visit, so please reach out to us directly.\n\nWarmest regards,\nThe Guest Experience Team`,
        problem_solving: `Dear ${author},\n\nThank you for your valuable feedback. I am extremely sorry for the 45-minute check-in wait and the Wi-Fi issues on the 12th floor. This is definitely not the standard we aim for. We are upgrading our lobby check-in system and adding Wi-Fi extenders to the upper floors this week. Please contact me directly at manager@hotel.com so I can personally arrange a complimentary room upgrade for your next stay.\n\nKind regards,\nGeneral Manager`
      };
    }
  } else {
    if (rating >= 4) {
      return {
        standard: `Kính gửi Anh/Chị ${author},\n\nCảm ơn Anh/Chị đã dành thời gian chia sẻ trải nghiệm tuyệt vời tại khách sạn chúng tôi. Chúng tôi rất vui mừng khi biết phòng ốc sạch sẽ và các dịch vụ của khách sạn đã đáp ứng tốt kỳ vọng của quý khách. Ý kiến đóng góp quý báu này sẽ là động lực lớn để toàn thể đội ngũ tiếp tục nâng cao chất lượng dịch vụ. Hy vọng sẽ được đón tiếp quý khách quay trở lại trong tương lai gần.\n\nTrân trọng,\nBan Quản lý Khách sạn`,
        friendly: `Chào ${author} thân mến!\n\nCảm ơn bạn rất nhiều vì bài đánh giá siêu dễ thương này nha! 🥰 Đội ngũ nhân viên ai nấy đều vui mừng khôn xiết khi biết bạn đã có một kỳ nghỉ trọn vẹn và ưng ý view Hồ Tây của khách sạn. Lần tới quay lại nhớ nhắn tụi mình để chuẩn bị một góc phòng thật đẹp nữa nhé. Hẹn gặp lại bạn sớm nhất nha!\n\nThân thương,\nĐội ngũ CSKH`,
        problem_solving: `Kính gửi Anh/Chị ${author},\n\nChân thành cảm ơn Anh/Chị đã lựa chọn nghỉ dưỡng tại khách sạn chúng tôi và gửi lại phản hồi. Chúng tôi rất vui khi dịch vụ phòng và buffet sáng làm quý khách hài lòng. Về phản hồi liên quan đến khu vực hồ bơi hơi đông đúc vào giờ cao điểm, chúng tôi đang tiến hành phân bổ lại thời gian phục vụ để đảm bảo không gian thư giãn tối đa cho quý khách. Rất mong sẽ được phục vụ quý khách tốt hơn nữa ở kỳ nghỉ tiếp theo.\n\nTrân trọng,\nĐội ngũ Dịch vụ Khách hàng`
      };
    } else {
      return {
        standard: `Kính gửi Anh/Chị ${author},\n\nChúng tôi chân thành xin lỗi vì những trải nghiệm chưa tốt của Anh/Chị trong kỳ nghỉ vừa qua, đặc biệt là sự cố điều hòa hỏng giữa đêm và sự chậm trễ của nhân viên lễ tân trực ca. Đây hoàn toàn không phải là tiêu chuẩn dịch vụ mà chúng tôi hướng tới. Ban quản lý đã làm việc nghiêm túc với bộ phận kỹ thuật và đội ngũ ca đêm để chấn chỉnh thái độ phục vụ. Rất mong quý khách rộng lòng bỏ qua và cho chúng tôi cơ hội được đón tiếp chu đáo hơn trong tương lai.\n\nTrân trọng,\nBan Quản lý Khách sạn`,
        friendly: `Chào Anh/Chị ${author},\n\nNghe tin gia đình mình đã phải trải qua một đêm nóng bức vì điều hòa gặp sự cố, cả đội ngũ chúng em thực sự cảm thấy vô cùng áy náy và xót xa. 🥺 Chúng em thành thật xin lỗi vì các bạn lễ tân ca đêm đã không xử lý nhanh chóng vấn đề này cho mình. Chúng em đã tiến hành bảo dưỡng toàn bộ hệ thống điều hòa và nhắc nhở nghiêm khắc thái độ của nhân viên trực ca. Mong Anh/Chị vẫn thương yêu và cho tụi em cơ hội được đón tiếp gia đình mình chu đáo hơn ở lần sau nhé ạ!\n\nThân mến,\nĐội ngũ Lễ tân`,
        problem_solving: `Kính gửi Anh/Chị ${author},\n\nTôi là Quản lý trưởng của khách sạn. Tôi vô cùng xin lỗi về sự cố điều hòa hỏng và thái độ phục vụ thiếu trách nhiệm của nhân viên ca đêm mà Anh/Chị đã phản ánh. Sự việc này là lỗi lớn của chúng tôi và tôi đã đình chỉ công tác nhân viên liên quan để đào tạo lại. Để bù đắp cho trải nghiệm tồi tệ này, tôi xin phép được gửi tặng gia đình một voucher miễn phí 1 đêm nghỉ phòng Executive Suite cho lần lưu trú tiếp theo. Xin vui lòng liên hệ tôi trực tiếp qua email: manager@ucorm.com để tôi được sắp xếp chu đáo nhất.\n\nKính thư,\nQuản lý Trưởng`
      };
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json({ success: false, error: "Missing reviewId" }, { status: 400 });
    }

    const review = await getReviewById(reviewId);
    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
          }
        });

        const prompt = `Bạn là một trợ lý AI quản lý danh tiếng trực tuyến (ORM) chuyên nghiệp cho một doanh nghiệp dịch vụ (như khách sạn, nhà hàng).
Hãy viết 3 câu trả lời khác nhau (tiếng Việt hoặc cùng ngôn ngữ chính của đánh giá từ khách hàng nếu đánh giá bằng ngôn ngữ khác) cho đánh giá sau đây:
Tên người đánh giá: "${review.author}"
Số sao đánh giá: ${review.rating} sao
Nội dung đánh giá: "${review.text}"

Hãy viết 3 phản hồi tương ứng với 3 phong cách (tông giọng) khác nhau:
1. "standard" (Tiêu chuẩn): Chuyên nghiệp, lịch sự, đúng chuẩn mực dịch vụ, cảm ơn chu đáo.
2. "friendly" (Thân thiện): Ấm áp, cá nhân hóa, vui vẻ, hiếu khách, coi khách hàng như bạn bè.
3. "problem_solving" (Khắc phục lỗi): Cực kỳ thấu hiểu, đồng cảm cao độ, gửi lời xin lỗi chân thành (đặc biệt quan trọng nếu số sao dưới 4), đề xuất giải pháp xử lý cụ thể, hoặc cung cấp phương thức liên hệ trực tiếp (hotline/email của quản lý) để hỗ trợ thêm.

Yêu cầu định dạng trả về bắt buộc phải là một đối tượng JSON có cấu trúc chính xác như sau, không kèm theo markdown hay ký tự thừa:
{
  "standard": "Nội dung câu trả lời tiêu chuẩn",
  "friendly": "Nội dung câu trả lời thân thiện",
  "problem_solving": "Nội dung câu trả lời khắc phục lỗi"
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const replies = JSON.parse(responseText);

        if (replies.standard && replies.friendly && replies.problem_solving) {
          review.aiReplies = {
            standard: replies.standard.trim(),
            friendly: replies.friendly.trim(),
            problem_solving: replies.problem_solving.trim()
          };
          await saveReview(review);
          return NextResponse.json({ success: true, isMock: false, replies: review.aiReplies });
        }
      } catch (aiError) {
        console.error("Gemini API call failed, falling back to mock reply generation:", aiError);
      }
    }

    // Fallback: Use high-quality mock generator
    const mockReplies = generateMockAIReplies(review.author, review.rating, review.text);
    review.aiReplies = mockReplies;
    await saveReview(review);

    return NextResponse.json({ success: true, isMock: true, replies: mockReplies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
