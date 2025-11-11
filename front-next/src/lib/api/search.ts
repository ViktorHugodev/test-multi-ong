import { apiClient } from './client';
import { Product } from '@/types/product.types';

export interface SearchResponse {
  results: Product[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    aiSuccess: boolean;
    fallbackUsed: boolean;
    interpretation: string;
    latency: number;
  };
}

export const searchApi = {
  intelligentSearch: async (query: string, page = 1, pageSize = 20) => {
    const response = await apiClient.post<SearchResponse>('/public/search',
      { query },
      { params: { page, pageSize } }
    );
    return response.data;
  },
};
