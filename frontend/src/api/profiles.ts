import supabase from './supabaseClient';

export interface Profile {
  id: string; // auth 사용자 id (uuid)
  email: string | null;
  nickname: string;
  avatar_image_url: string | null;
  created_at: string;
}

// 내 프로필 또는 특정 사용자 프로필 (id로 조회)
export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// 글 작성자 프로필. posts가 작성자를 email로 저장하고 있어서 email로 찾는다.
// (새 ERD에서는 member id로 연결할 예정)
export async function getProfileByEmail(email: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) throw error;
  return data;
}

export async function updateNickname(
  userId: string,
  nickname: string
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// url에 null을 넘기면 아바타 삭제
export async function updateAvatarUrl(
  userId: string,
  url: string | null
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_image_url: url })
    .eq('id', userId);

  if (error) throw error;
}
