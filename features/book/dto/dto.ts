
// Types
export interface BookInput {
  title: string;
  author: string;
  cover_url?: string | null;
  total_pages?: number | null;
  status?: 'TO_READ' | 'READING' | 'FINISHED' | 'CANCELLED';
}