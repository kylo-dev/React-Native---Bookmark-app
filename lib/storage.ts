import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const uploadBookCover = async (imageUri: string): Promise<string | null> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });

    const randomString = Math.random().toString(36).slice(2, 15);
    const filePath = `covers/${randomString}.jpg`;

    const { error } = await supabase.storage
      .from('book-covers')
      .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

    if (error) throw error;

    const { data } = supabase.storage.from('book-covers').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    return null;
  }
};
