import supabase from './supabaseClient';

const bucket = import.meta.env.VITE_PUBLIC_STORAGE_BUCKET as string;

// 업로드 위치. 4단계(S3)에서도 같은 구분을 쓸 수 있게 이름을 붙여 둔다.
export type ImageFolder = 'thumbnail' | 'avatar-image' | 'content';

// 파일 업로드 후 공개 URL을 돌려준다.
// content(본문 이미지)는 기존처럼 버킷 최상위에 저장한다.
export async function uploadImage(
  folder: ImageFolder,
  file: File | Blob
): Promise<string> {
  const ext = file.type.split('/')[1];
  const fileName = `${Date.now()}.${ext}`;
  const path = folder === 'content' ? fileName : `${folder}/${fileName}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// 공개 URL로 파일 삭제.
// URL이 ".../public/{bucket}/{path}" 모양이라 bucket 뒤쪽을 경로로 쓴다.
export async function deleteImageByUrl(url: string): Promise<void> {
  const path = url.split(`${bucket}/`)[1];
  if (!path) return;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
