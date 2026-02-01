export interface Prefecture {
  id: number;
  name: string;
  name_en: string;
  region: string;
  visit_count: number;
}

export interface Visit {
  id: number;
  prefecture_id: number;
  visited_at: string;
  memo: string | null;
  prefecture_name?: string;
}

export interface TripItem {
  id: number;
  trip_id: number;
  item_type: 'transport' | 'hotel' | 'spot';
  name: string;
  datetime: string | null;
  prefecture_id: number | null;
  details: Record<string, unknown> | null;
  order: number;
}

export interface Trip {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  items?: TripItem[];
}
