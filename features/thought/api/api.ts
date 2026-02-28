import { supabase } from '../../../lib/supabase';
import { ThoughtInput } from '../dto/dto';
import { getUserId } from '../../../lib/auth';

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
