import supabase from './supabaseClient';

// 컴포넌트가 쓰는 게시글 모양. Supabase가 만든 타입(database.types)을 밖으로 내보내지 않으려고 직접 정의한다.
// 필드 이름은 지금 컴포넌트들이 쓰는 그대로(snake_case) 둔다. 서버로 바꿀 때 이 파일 안에서 변환하면 된다.
export interface Post {
  id: number;
  title: string;
  content: string;
  content_summary: string | null;
  thumbnail_url: string | null;
  image_url: string | null; // JSON 문자열로 저장된 이미지 URL 배열
  email: string | null;
  event_date: string | null;
  rating: number | null;
  created_at: string;
}

// 등록·수정할 때 보내는 값. id, rating, created_at은 DB가 정한다.
export type PostInput = Pick<
  Post,
  | 'title'
  | 'content'
  | 'content_summary'
  | 'thumbnail_url'
  | 'image_url'
  | 'email'
  | 'event_date'
>;

export type PostSort = 'latest' | 'oldest' | 'rating_high' | 'rating_low';

export const POST_PAGE_SIZE = 8;

const SORT_OPTIONS: Record<PostSort, { column: string; ascending: boolean }> = {
  latest: { column: 'event_date', ascending: false },
  oldest: { column: 'event_date', ascending: true },
  rating_high: { column: 'rating', ascending: false },
  rating_low: { column: 'rating', ascending: true },
};

// 목록 (무한 스크롤). page는 0부터 시작.
export async function getPosts(page: number, sort: PostSort): Promise<Post[]> {
  const from = page * POST_PAGE_SIZE;
  const to = from + POST_PAGE_SIZE - 1;
  const { column, ascending } = SORT_OPTIONS[sort];

  const { data, error } = await supabase
    .from('posts')
    .select()
    .order(column, { ascending, nullsFirst: false })
    .range(from, to);

  if (error) throw error;
  return data;
}

export async function getPost(id: number): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createPost(input: PostInput): Promise<void> {
  const { error } = await supabase.from('posts').insert([input]);
  if (error) throw error;
}

export async function updatePost(id: number, input: PostInput): Promise<void> {
  const { error } = await supabase.from('posts').update(input).eq('id', id);
  if (error) throw error;
}

export async function deletePost(id: number): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}
