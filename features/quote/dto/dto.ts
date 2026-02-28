export interface QuoteInput {
  book_id: number;
  text: string;
  page_number?: number | null;
  is_favorite?: boolean;
  tags?: string[];
}
