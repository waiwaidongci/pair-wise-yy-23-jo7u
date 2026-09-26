export interface RemedialSession {
  id: number;
  reasons: string[];
  reason_key: string;
  scheduled_date: string;
  queue: number[];
  finished_symbol_ids: number[];
  reason_by_symbol: Record<string, string>;
  created_at: string;
}
