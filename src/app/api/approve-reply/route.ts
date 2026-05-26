import { NextRequest, NextResponse } from 'next/server';
import { getReviewById, saveReview } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId, replyText, tone } = body;

    if (!reviewId || !replyText || !tone) {
      return NextResponse.json({ success: false, error: "Missing required fields (reviewId, replyText, tone)" }, { status: 400 });
    }

    const review = await getReviewById(reviewId);
    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    review.status = 'resolved';
    review.approvedReply = replyText;
    review.approvedTone = tone;
    await saveReview(review);

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
