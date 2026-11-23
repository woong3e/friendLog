import supabase from './supabaseClient';

export interface Rating {
  id: number;
  post_id: number;
  user_id: string;
  rating: number | null; // 0.5 ~ 5, 0.5 단위
  comment: string | null;
  nickname: string;
  created_at: string;
}

// 한줄평 목록에 보여 줄 작성자 정보
export interface RatingAuthor {
  id: string;
  nickname: string | null;
  avatar_image_url: string | null;
}

export interface RatingWithAuthor extends Rating {
  profiles: RatingAuthor | null;
}

export interface RatingSummary {
  average: number | null; // 평가가 없으면 null
  distribution: number[]; // [0.5점 개수, 1점 개수, ..., 5점 개수] 10칸
}

export type RatingInput = Pick<
  Rating,
  'post_id' | 'user_id' | 'rating' | 'comment' | 'nickname'
>;

const DISTRIBUTION_SIZE = 10;

// 평균과 점수 분포. 지금은 별점을 전부 받아서 여기서 계산한다.
// 서버로 바꾸면 서버가 계산한 값을 받기만 하면 되도록, 계산 결과 모양으로 돌려준다.
export async function getRatingSummary(postId: number): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('post_id', postId);

  if (error) throw error;

  const distribution = Array(DISTRIBUTION_SIZE).fill(0);
  if (data.length === 0) return { average: null, distribution };

  const scores = data.map((r) => r.rating ?? 0);
  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  scores.forEach((score) => {
    const index = score * 2 - 1; // 0.5점 → 0번 칸, 5점 → 9번 칸
    if (index >= 0 && index < DISTRIBUTION_SIZE) distribution[index] += 1;
  });

  return { average, distribution };
}

// 한줄평 목록 (최신순) + 작성자 프로필.
// 평가와 프로필을 따로 가져와서 합친다. 서버에서는 조인 한 번으로 바뀔 부분.
export async function getRatingsWithAuthor(
  postId: number
): Promise<RatingWithAuthor[]> {
  const { data: ratings, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (ratings.length === 0) return [];

  const userIds = ratings.map((r) => r.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_image_url')
    .in('id', userIds);

  // 프로필을 못 가져와도 한줄평은 보여 준다 (작성자는 'Unknown'으로 표시됨)
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return ratings.map((r) => ({ ...r, profiles: null }));
  }

  return ratings.map((r) => ({
    ...r,
    profiles: profiles.find((p) => p.id === r.user_id) ?? null,
  }));
}

// 이 사용자가 이 글에 별점을 남겼는지
export async function hasRated(postId: number, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .gte('rating', 0.5)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

// 평가 등록 (같은 글에 이미 남겼다면 덮어쓰기)
export async function upsertRating(input: RatingInput): Promise<void> {
  const { error } = await supabase.from('ratings').upsert([input]);
  if (error) throw error;
}
