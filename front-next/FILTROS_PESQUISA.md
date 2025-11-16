# Componente de Filtros com Pesquisa por Texto

## 📋 Visão Geral

O componente `SearchFiltersComponent` agora possui um **campo de pesquisa por texto** totalmente funcional que permite aos usuários buscar produtos digitando palavras-chave.

## ✨ Funcionalidades Implementadas

### 1. Campo de Pesquisa por Texto
- **Localização**: Primeiro campo no painel de filtros
- **Label**: "Pesquisar por texto"
- **Placeholder**: "Digite para buscar..."
- **Função**: Busca por nome ou descrição do produto

### 2. Melhorias no Layout
- ✅ Botão "Limpar" movido para o header (aparece apenas quando há filtros ativos)
- ✅ Campo de pesquisa com altura consistente (h-10)
- ✅ Labels mais destacadas com `font-semibold`
- ✅ Placeholders simplificados ("Mín" e "Máx" para preços)
- ✅ Botão "Aplicar Filtros" em destaque (largura total)

### 3. Estrutura dos Filtros

```typescript
interface SearchFilters {
  keyword?: string;      // 🔍 Campo de pesquisa por texto
  category?: string;     // Categoria do produto
  priceMin?: number;     // Preço mínimo
  priceMax?: number;     // Preço máximo
}
```

## 🎯 Como Usar

### Exemplo de Uso Básico

```tsx
import { SearchFiltersComponent } from '@/components/catalog/search/search-filters';

function MeuComponente() {
  const [filters, setFilters] = useState<SearchFilters>({});
  
  return (
    <SearchFiltersComponent
      filters={filters}
      onFiltersChange={setFilters}
      onClear={() => setFilters({})}
      hasActiveFilters={Object.keys(filters).length > 0}
    />
  );
}
```

### Fluxo de Pesquisa

1. **Usuário digita** no campo "Pesquisar por texto"
2. **Estado local** é atualizado instantaneamente
3. **Usuário clica** em "Aplicar Filtros"
4. **Callback** `onFiltersChange` é chamado com os filtros atualizados
5. **API** recebe o parâmetro `keyword` e busca nos campos `name` e `description`

## 🔄 Integração com a API

O campo `keyword` é combinado com a query principal e enviado para a API de busca inteligente:

```typescript
// Exemplo de como a API processa os filtros
const intelligentSearch = async (query: string, filters: SearchFilters) => {
  // Construir query aprimorada
  let enhancedQuery = query;
  
  // Adicionar keyword aos filtros
  if (filters.keyword) {
    enhancedQuery += ` ${filters.keyword}`;
  }
  
  // Adicionar outros filtros
  if (filters.category) {
    enhancedQuery += ` categoria:${filters.category}`;
  }
  if (filters.priceMin) {
    enhancedQuery += ` preço mínimo:${filters.priceMin}`;
  }
  if (filters.priceMax) {
    enhancedQuery += ` preço máximo:${filters.priceMax}`;
  }
  
  // Enviar para a API
  const response = await apiClient.post('/search', {
    query: enhancedQuery,
    page: 1,
    pageSize: 20
  });
  
  return response.data;
};
```

### Como funciona a busca combinada

1. **Query Principal**: "doces baratos"
2. **Keyword**: "chocolate"
3. **Categoria**: "Doces"
4. **Preço**: 10 a 50

**Query Final Enviada**: `"doces baratos chocolate categoria:Doces preço mínimo:10 preço máximo:50"`

A IA processa essa query completa e retorna produtos relevantes.

## 📱 Layout Responsivo

O componente é totalmente responsivo:

- **Mobile**: Filtros em coluna única
- **Desktop**: Sidebar lateral com filtros
- **Tablet**: Layout adaptativo

## 🎨 Aparência Visual

```
┌─────────────────────────────────┐
│ Filtros              [Limpar]   │
├─────────────────────────────────┤
│ Pesquisar por texto             │
│ ┌─────────────────────────────┐ │
│ │ Digite para buscar...       │ │
│ └─────────────────────────────┘ │
│ Busca por nome ou descrição     │
│                                 │
│ Categoria                       │
│ ┌─────────────────────────────┐ │
│ │ Todas as categorias      ▼  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Faixa de Preço (R$)             │
│ ┌──────────┐  ┌──────────┐     │
│ │ Mín      │  │ Máx      │     │
│ └──────────┘  └──────────┘     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │    Aplicar Filtros          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🧪 Testando o Componente

### 1. Acesse a página do catálogo
```
http://localhost:3000/catalogo
```

### 2. Teste o campo de pesquisa
- Digite "chocolate" no campo de pesquisa
- Selecione uma categoria (ex: "Doces")
- Defina uma faixa de preço (ex: 10 a 50)
- Clique em "Aplicar Filtros"

### 3. Verifique os filtros ativos
- Os filtros aplicados aparecem como badges abaixo do botão
- O botão "Limpar" aparece no header quando há filtros ativos

## 🔍 Comportamento de Busca

### Busca Combinada
O sistema combina dois tipos de busca:

1. **Busca Inteligente** (campo principal no topo)
   - Usa linguagem natural
   - Exemplo: "doces baratos até 30 reais"

2. **Busca por Texto** (campo nos filtros)
   - Busca literal em nome e descrição
   - Exemplo: "chocolate artesanal"

### Prioridade
- Ambas as buscas funcionam em conjunto
- Os resultados são filtrados por TODOS os critérios ativos

## 📝 Notas Técnicas

### Estado Local vs Estado Global
- **Estado Local**: Usado para edição dos filtros sem aplicar imediatamente
- **Estado Global**: Atualizado apenas ao clicar em "Aplicar Filtros"
- Isso evita requisições desnecessárias à API

### Validação
- Preço mínimo deve ser >= 0
- Preço máximo deve ser >= preço mínimo
- Botão "Aplicar" desabilitado se validação falhar

### Acessibilidade
- Labels adequados para screen readers
- ARIA labels nos inputs
- Navegação por teclado funcional

## 🚀 Próximos Passos

Para melhorar ainda mais o componente:

1. **Debounce no campo de texto**: Aplicar filtros automaticamente após parar de digitar
2. **Histórico de buscas**: Salvar buscas recentes do usuário
3. **Sugestões**: Autocompletar baseado em produtos existentes
4. **Filtros avançados**: Adicionar mais opções (estoque, organização, etc.)

## 📚 Arquivos Relacionados

- `src/components/catalog/search/search-filters.tsx` - Componente de filtros
- `src/components/catalog/search/intelligent-search.tsx` - Componente principal
- `src/components/catalog/types/index.ts` - Tipos e interfaces
- `src/hooks/use-intelligent-search.ts` - Hook de busca
- `src/app/catalogo/page.tsx` - Página do catálogo
