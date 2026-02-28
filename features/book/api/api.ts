import { supabase } from "@/lib/supabase";
import { BookInput } from "../dto/dto";
import { getUserId } from '@/lib/auth';

// ------------------------------
// Books API
// ------------------------------
export const apiBooks = {
  getBooks: async (statusFilter?: string) => {
    let query = supabase.from('books').select(`*, quotes(count)`);

    if (statusFilter && statusFilter !== 'All Books') {
      const dbStatus = statusFilter === 'Reading' ? 'READING' :
                       statusFilter === 'Finished' ? 'FINISHED' : 'CANCELLED';
      query = query.eq('status', dbStatus);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getBookById: async (id: number) => {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
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
