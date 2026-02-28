import { supabase } from '../../../lib/supabase';
import { QuoteInput } from '../dto/dto';
import { getUserId } from '../../../lib/auth';

export const apiQuotes = {
  getQuotesByBookId: async (bookId: number) => {
    const { data, error } = await supabase.from('quotes')
      .select(`*, thoughts(count)`)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getAllQuotes: async () => {
    const { data, error } = await supabase.from('quotes')
      .select(`*, book:books(*), thoughts(count)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getQuoteById: async (id: number) => {
    const { data, error } = await supabase.from('quotes').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  createQuote: async (input: QuoteInput) => {
    const userId = await getUserId();
    const { data, error } = await supabase.from('quotes')
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateQuote: async (id: number, updates: Partial<QuoteInput>) => {
    const { data, error } = await supabase.from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteQuote: async (id: number) => {
    const { error } = await supabase.from('quotes').delete().eq('id', id);
    if (error) throw error;
  },
  
  toggleFavorite: async (id: number, isFavorite: boolean) => {
    return apiQuotes.updateQuote(id, { is_favorite: isFavorite });
  }
};
