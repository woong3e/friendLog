import type { Session } from '@supabase/supabase-js';
import supabase from './supabaseClient';

// 앱이 쓰는 로그인 정보. Supabase의 Session 타입을 밖으로 내보내지 않으려고 필요한 것만 담는다.
// 5단계에서 JWT로 바꾸면 이 모양을 토큰에서 채우면 된다.
export interface AuthSession {
  user: {
    id: string;
    email: string | null;
    nickname: string | null; // 가입할 때 입력한 닉네임
  };
}

function toAuthSession(session: Session | null): AuthSession | null {
  if (!session) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
      nickname: session.user.user_metadata?.nickname ?? null,
    },
  };
}

// 저장된 로그인 상태 확인 (새로고침 직후)
export async function getSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession();
  return toAuthSession(data.session);
}

// 로그인·로그아웃·토큰 갱신 등 상태가 바뀔 때마다 callback 호출.
// 돌려주는 함수를 부르면 구독을 끊는다.
export function onAuthChange(
  callback: (session: AuthSession | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(toAuthSession(session));
  });
  return () => data.subscription.unsubscribe();
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthSession> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return toAuthSession(data.session);
}

// 회원가입 → 인증 메일 발송. 닉네임은 profiles에도 저장한다.
export async function signUp(
  email: string,
  password: string,
  nickname: string
): Promise<void> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // TODO: localhost로 하드코딩되어 있음 (기존 코드 그대로). 서버 전환 때 함께 정리
      emailRedirectTo: `http://localhost:5173/signup/otp?email=${email}`,
      data: { nickname },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('회원 정보가 없습니다.');

  await supabase.from('profiles').update({ nickname }).eq('id', data.user.id);
}

// 메일로 받은 6자리 코드 확인. 성공하면 로그인 상태가 된다.
export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<AuthSession | null> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  return toAuthSession(data.session);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
