import supabase from './supabase';

export function getImageUrl(path) {
  return `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public${path}`;
}
