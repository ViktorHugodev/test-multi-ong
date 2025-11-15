// ========================================
// Arquivo: src/app/catalogo/page.tsx
// Descrição: Página principal do catálogo com busca inteligente
// ========================================

import { Metadata } from 'next';
import { IntelligentSearch } from '@/components/catalog/search/intelligent-search';

export const metadata: Metadata = {
  title: 'Catálogo de Produtos | Marketplace Multi-ONG',
  description:
    'Explore produtos de diversas ONGs com busca inteligente. Encontre artesanatos, alimentos, vestuário e muito mais usando linguagem natural.',
  keywords: [
    'marketplace',
    'ong',
    'produtos sociais',
    'artesanato',
    'alimentos',
    'vestuário',
    'busca inteligente',
  ],
};

export default function CatalogoPage() {
  return <IntelligentSearch />;
}

// ========================================
// Notas de Implementação:
// - Metadata otimizada para SEO
// - Página simples que renderiza o componente principal
// - Client-side rendering via 'use client' no componente
// - Rota: /catalogo
// ========================================
