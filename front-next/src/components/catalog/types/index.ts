// ========================================
// Arquivo: src/components/catalog/types/index.ts
// Descrição: Types e interfaces para o componente de busca inteligente
// ========================================

import { Product } from '@/types/product.types';

export interface SearchMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  aiSuccess: boolean;
  fallbackUsed: boolean;
  interpretation: string;
  latency: number;
}

export interface SearchResponse {
  results: Product[];
  meta: SearchMeta;
}

export interface SearchFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  /** Texto livre de palavras-chave para complementar a query principal */
  keyword?: string;
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: Product[];
  meta: SearchMeta | null;
  loading: boolean;
  error: string | null;
}

export type Category =
  | 'Artesanato'
  | 'Alimentos'
  | 'Vestuário'
  | 'Decoração'
  | 'Doces';

export const CATEGORIES: Category[] = [
  'Artesanato',
  'Alimentos',
  'Vestuário',
  'Decoração',
  'Doces',
];

// ========================================
// Notas de Implementação:
// - Reutiliza Product do types global
// - SearchMeta contém informações de IA
// - SearchFilters são opcionais e complementares
// - CATEGORIES é um array constante com categorias válidas
// ========================================
