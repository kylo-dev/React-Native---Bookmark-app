import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const uploadBookCover = async (imageUri: string): Promise<string | null> => {
  try {
    console.log('[Storage] 이미지 읽기 시작:', imageUri);
    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
    console.log('[Storage] base64 변환 완료, 길이:', base64.length);

    const randomString = Math.random().toString(36).slice(2, 15);
    const filePath = `covers/${randomString}.jpg`;

    console.log('[Storage] 업로드 시작:', filePath);
    const { error } = await supabase.storage
      .from('book-covers')
      .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

    if (error) {
      console.error('[Storage] 업로드 에러:', error);
      throw error;
    }

    const { data } = supabase.storage.from('book-covers').getPublicUrl(filePath);
    console.log('[Storage] 업로드 성공, publicUrl:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('[Storage] 이미지 업로드 실패:', error);
    return null;
  }
};
