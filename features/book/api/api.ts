import { supabase } from "@/lib/supabase";
import { BookInput } from "../dto/dto";
import { getUserId } from '@/lib/auth';
import { getMonthDateRange } from '@/utils/date';

// ------------------------------
// Books API
// ------------------------------
export const apiBooks = {
  getBooks: async (statusFilter?: string) => {
    let query = supabase.from('books').select(`*, quotes(count)`);

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /** 해당 년월에 생성된 책 조회 (TO_READ 제외, 날짜 기준, 로컬 타임존) */
  getBooksByMonth: async (year: number, month: number) => {
    const { start, end } = getMonthDateRange(year, month);
    const { data, error } = await supabase
      .from('books')
      .select(`*, quotes(count)`)
      .neq('status', 'TO_READ')
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getBookById: async (id: number) => {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  createBook: async (input: BookInput) => {
    const userId = await getUserId();
    const { data, error } = await supabase.from('books')
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateBook: async (id: number, updates: Partial<BookInput>) => {
    const { data, error } = await supabase.from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteBook: async (id: number) => {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
  }
};
