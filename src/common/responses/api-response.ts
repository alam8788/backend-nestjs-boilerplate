export interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T | null;
  meta?: {
    total_items: number;
    item_count: number;
    items_per_page: number;
    total_pages: number;
    current_page: number;
  } | null;
}
