// ========================================
// Arquivo: src/components/catalog/search/search-status.tsx
// Descrição: Badges de status da busca (IA/Fallback) e interpretação
// ========================================

import { SearchMeta } from '@/components/catalog/types';
import { Badge } from '@/components/ui/badge';
import { Bot, AlertTriangle, Info } from 'lucide-react';

interface SearchStatusProps {
  meta: SearchMeta;
  showLatency?: boolean;
}

export function SearchStatus({ meta, showLatency = false }: SearchStatusProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="space-y-3">
      {/* Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Badge de Busca Inteligente */}
        {meta.aiSuccess && !meta.fallbackUsed && (
          <Badge variant="default" className="gap-1.5 bg-green-500 hover:bg-green-600">
            <Bot className="h-3.5 w-3.5" />
            <span>Busca Inteligente</span>
          </Badge>
        )}

        {/* Badge de Busca Textual (Fallback) */}
        {meta.fallbackUsed && (
          <Badge variant="secondary" className="gap-1.5 bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Busca Textual</span>
          </Badge>
        )}

        {/* Latency (apenas em dev) */}
        {showLatency && isDevelopment && (
          <Badge variant="outline" className="gap-1.5 text-xs">
            <span>⚡ {meta.latency}ms</span>
          </Badge>
        )}
      </div>

      {/* Interpretação da Busca */}
      {meta.interpretation && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-blue-900 font-medium">
              Interpretação da busca:
            </p>
            <p className="text-sm text-blue-700 mt-0.5">
              {meta.interpretation}
            </p>
          </div>
        </div>
      )}

      {/* Total de Resultados */}
      <p className="text-sm text-gray-600">
        Mostrando{' '}
        <span className="font-semibold text-gray-900">
          {meta.pageSize * (meta.page - 1) + 1}
        </span>
        {' - '}
        <span className="font-semibold text-gray-900">
          {Math.min(meta.pageSize * meta.page, meta.total)}
        </span>
        {' de '}
        <span className="font-semibold text-gray-900">{meta.total}</span>
        {' '}
        {meta.total === 1 ? 'resultado' : 'resultados'}
      </p>
    </div>
  );
}

// ========================================
// Notas de Implementação:
// - Badge verde quando IA funciona (aiSuccess=true)
// - Badge amarelo quando usa fallback (fallbackUsed=true)
// - Latency visível apenas em modo dev
// - Interpretação da IA exibida em destaque
// - Contador de resultados formatado
// - Acessível com ícones e cores de alto contraste
// ========================================
