import { supabase } from './supabase';

// User Helpers
export const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

// Types
export interface BookInput {
  title: string;
  author: string;
  cover_url?: string | null;
  total_pages?: number | null;
  status?: 'TO_READ' | 'READING' | 'FINISHED' | 'CANCELLED';
}

export interface QuoteInput {
  book_id: number;
  text: string;
  page_number?: number | null;
  is_favorite?: boolean;
  tags?: string[];
}

export interface ThoughtInput {
  quote_id: number;
  text: string;
}

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

// ------------------------------
// Quotes API
// ------------------------------
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

// ------------------------------
// Thoughts API
// ------------------------------
export const apiThoughts = {
  getThoughtsByQuoteId: async (quoteId: number) => {
    const { data, error } = await supabase.from('thoughts')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: true }); // 타임라인형이므로 오름차순
    if (error) throw error;
    return data;
  },

  createThought: async (input: ThoughtInput) => {
    const userId = await getUserId();
    const { data, error } = await supabase.from('thoughts')
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateThought: async (id: number, text: string) => {
    const { data, error } = await supabase.from('thoughts')
      .update({ text })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteThought: async (id: number) => {
    const { error } = await supabase.from('thoughts').delete().eq('id', id);
    if (error) throw error;
  }
};
