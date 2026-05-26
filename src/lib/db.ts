import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export interface AIReplies {
  standard: string;
  friendly: string;
  problem_solving: string;
}

export interface Review {
  id: string;
  placeId: string;
  author: string;
  avatar?: string;
  rating: number; // 1 to 5
  text: string;
  time: string; // e.g. "2 days ago" or "1 hour ago"
  status: 'pending' | 'resolved';
  aiReplies?: AIReplies;
  approvedReply?: string;
  approvedTone?: 'standard' | 'friendly' | 'problem_solving';
  createdAt: string; // ISO String
}

const DB_DIR = path.join(process.cwd(), 'src', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Supabase Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log("⚡ [Database] Client initialized. Running in Cloud Mode via Supabase PostgreSQL.");
  } catch (err) {
    console.error("❌ [Database] Failed to initialize Supabase client:", err);
  }
} else {
  console.log("📦 [Database] Environment keys not found. Running in Local Offline Mode via src/data/db.json.");
}

// Realistic starting reviews
const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-01",
    placeId: "mock-hilton-hanoi",
    author: "Nguyễn Văn Hùng",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Khách sạn tuyệt vời! Nhân viên cực kỳ thân thiện và chu đáo. Phòng ốc sạch sẽ, rộng rãi, view nhìn thẳng ra Hồ Tây rất đẹp. Bữa sáng buffet đa dạng món ăn từ Á sang Âu. Chắc chắn sẽ quay lại khi có dịp ra Hà Nội.",
    time: "2 giờ trước",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rev-02",
    placeId: "mock-hilton-hanoi",
    author: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    rating: 3,
    text: "The location is perfect, and the room was very clean. However, the check-in process was extremely slow, we had to wait for almost 45 minutes in the lobby. Also, the Wi-Fi in our room on the 12th floor was weak and constantly disconnected.",
    time: "1 ngày trước",
    status: "pending",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rev-03",
    placeId: "mock-hilton-hanoi",
    author: "Trần Thị Lan",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
    rating: 1,
    text: "Trải nghiệm rất tệ hại! Điều hòa trong phòng bị hỏng giữa đêm hè oi bức, tôi gọi lễ tân 3 lần nhưng không có ai lên hỗ trợ, bắt gia đình tôi phải chịu đựng đến sáng. Thái độ phục vụ của nhân viên ca đêm quá thiếu trách nhiệm và không chuyên nghiệp. Sẽ không bao giờ quay lại!",
    time: "3 ngày trước",
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Read from JSON database (Fallback)
function readJSONDB(): Review[] {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      writeJSONDB(INITIAL_REVIEWS);
      return INITIAL_REVIEWS;
    }

    const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
    if (!fileContent.trim()) {
      writeJSONDB(INITIAL_REVIEWS);
      return INITIAL_REVIEWS;
    }

    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading from local JSON database:", error);
    return INITIAL_REVIEWS;
  }
}

// Write to JSON database (Fallback)
function writeJSONDB(data: Review[]): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing to local JSON database:", error);
  }
}

// --- HYBRID EXPORTED ASYNC API METHODS ---

/**
 * Get all reviews sorted by createdAt descending
 */
export async function getReviews(): Promise<Review[]> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        throw error;
      }

      // Auto-seed Supabase with initial reviews if it's completely empty
      if (data && data.length === 0) {
        console.log("🌱 [Database] Supabase is empty. Seeding initial reviews...");
        for (const review of INITIAL_REVIEWS) {
          await supabaseClient.from('reviews').insert({
            id: review.id,
            placeId: review.placeId,
            author: review.author,
            avatar: review.avatar,
            rating: review.rating,
            text: review.text,
            time: review.time,
            status: review.status,
            aiReplies: review.aiReplies || null,
            approvedReply: review.approvedReply || null,
            approvedTone: review.approvedTone || null,
            createdAt: review.createdAt
          });
        }
        
        // Fetch again after seeding
        const { data: seededData } = await supabaseClient
          .from('reviews')
          .select('*')
          .order('createdAt', { ascending: false });
        if (seededData) {
          return seededData as Review[];
        }
      }

      return data as Review[];
    } catch (err) {
      console.error("⚠️ [Supabase] Error reading reviews, falling back to local JSON:", err);
      // Fallback if Supabase table isn't created yet or has query issues
    }
  }

  const reviews = readJSONDB();
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get a specific review by ID
 */
export async function getReviewById(id: string): Promise<Review | undefined> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }
      if (data) {
        return data as Review;
      }
    } catch (err) {
      console.error(`⚠️ [Supabase] Error reading review ${id}, falling back to local JSON:`, err);
    }
  }

  const reviews = readJSONDB();
  return reviews.find(r => r.id === id);
}

/**
 * Save or update a review
 */
export async function saveReview(review: Review): Promise<void> {
  if (supabaseClient) {
    try {
      // Ensure fields conform to database naming and JSON structure
      const { error } = await supabaseClient
        .from('reviews')
        .upsert({
          id: review.id,
          placeId: review.placeId,
          author: review.author,
          avatar: review.avatar,
          rating: review.rating,
          text: review.text,
          time: review.time,
          status: review.status,
          aiReplies: review.aiReplies || null,
          approvedReply: review.approvedReply || null,
          approvedTone: review.approvedTone || null,
          createdAt: review.createdAt
        });

      if (error) {
        throw error;
      }
      return;
    } catch (err) {
      console.error("⚠️ [Supabase] Error saving review, writing to local JSON:", err);
    }
  }

  const reviews = readJSONDB();
  const index = reviews.findIndex(r => r.id === review.id);

  if (index !== -1) {
    reviews[index] = review;
  } else {
    reviews.push(review);
  }
  writeJSONDB(reviews);
}
