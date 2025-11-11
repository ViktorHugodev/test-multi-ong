# 🚀 Prompt Claude Code - Marketplace Multi-ONG

## 📋 Contexto Resumido

Você está desenvolvendo um **Marketplace Multi-ONG** (teste técnico para vaga senior full-stack). O projeto conecta consumidores com ONGs parceiras para venda de produtos.

**Stack Tecnológica**:
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL + Redis + Bull/BullMQ
- **Frontend**: Next.js 14 (App Router) + TypeScript + shadcn/ui + Tailwind CSS + TanStack Query

**Status Atual**: Fase 1 (MVP) ~70% completo

**Arquivos de Referência** (leia quando necessário):
- `/mnt/project/architecture-decisions.md` - Decisões arquiteturais
- `/mnt/project/api-contracts.md` - Contratos de API
- `/mnt/project/coding-standards.md` - Padrões de código
- `/mnt/project/project-structure.md` - Estrutura do projeto
- `/mnt/project/roadmap.md` - **ATUALIZAR após cada sprint**

---

## 🎯 Objetivo da Sprint Atual

### Sprint 3: Completar Portal Público & Catálogo (Prioridade ALTA)

**Objetivo**: Criar interface completa para consumidores navegarem e comprarem produtos de todas as ONGs.

#### Backend (✅ JÁ IMPLEMENTADO)
- Endpoint GET /public/products (com filtros e paginação)
- Endpoint GET /public/products/:id
- Endpoint GET /public/categories

#### Frontend (⏳ PENDENTE - FOCO DESTA SPRINT)

**Tarefas**:

1. **Página Inicial do Marketplace** (`front-next/src/app/(public)/page.tsx`)
   - Layout responsivo com hero section
   - Integração com API `/public/products`
   - ProductGrid component para exibir produtos
   - Skeleton loaders durante carregamento
   - Empty state quando não há produtos

2. **ProductGrid Component** (`front-next/src/components/products/product-grid.tsx`)
   - Grid responsivo (1 col mobile, 2-3 tablet, 4 desktop)
   - Recebe array de produtos como prop
   - Map para renderizar ProductCard
   - Animações suaves (opcional)

3. **ProductCard Component** (`front-next/src/components/products/product-card.tsx`)
   - Exibir: imagem, nome, preço, categoria, nome da ONG
   - Badge de categoria
   - Link para página de detalhes
   - Hover effects
   - Botão "Ver Detalhes"

4. **ProductFilters Component** (`front-next/src/components/products/product-filters.tsx`)
   - Filtro por categoria (Select/Dropdown)
   - Filtro por faixa de preço (Range slider ou inputs)
   - Ordenação (preço crescente/decrescente, mais recentes)
   - Botão "Limpar Filtros"
   - Aplicar filtros ao clicar "Aplicar"

5. **Pagination Component** (`front-next/src/components/ui/pagination.tsx`)
   - Controles Previous/Next
   - Números de página
   - Indicador de página atual
   - Informação "Exibindo X-Y de Z produtos"

6. **Página de Detalhes do Produto** (`front-next/src/app/(public)/products/[id]/page.tsx`)
   - Fetch do produto específico
   - Layout com imagem grande + detalhes
   - Informações: nome, descrição, preço, categoria, estoque, peso
   - Informações da ONG vendedora
   - Seletor de quantidade
   - Botão "Adicionar ao Carrinho"
   - Breadcrumb de navegação

---

## 📐 Requisitos Técnicos

### Padrões de Código

**Components** (export function):
```typescript
// components/products/product-card.tsx
interface IProductCardProps {
  product: Product;
}

export function ProductCard({ product }: IProductCardProps) {
  // implementation
}
```

**Pages** (arrow function):
```typescript
// app/(public)/page.tsx
const HomePage = () => {
  // implementation
}

export default HomePage;
```

**Naming Conventions**:
- Components: `PascalCase`
- Files: `kebab-case`
- Functions/Variables: `camelCase`
- Types/Interfaces: `PascalCase` com prefixo (IProps, TData)
- Constants: `UPPER_SNAKE_CASE`

**Import Order**:
```typescript
// 1. React/Next
import { useState } from 'react';
import Link from 'next/link';

// 2. External Libraries
import { useQuery } from '@tanstack/react-query';

// 3. Components
import { ProductCard } from '@/components/products/product-card';

// 4. Utils/Types
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
```

### Integração com API

**Usar TanStack Query**:
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const { data, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => api.get('/public/products', { params: filters }),
});
```

**API Client** (já existe em `front-next/src/lib/api/`):
```typescript
import { api } from '@/lib/api';

// GET request
const response = await api.get('/public/products');

// POST request
const response = await api.post('/orders', orderData);
```

### Estilização com Tailwind + shadcn/ui

**Usar componentes shadcn/ui quando disponível**:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
```

**Classes Tailwind**:
- Cores: usar variáveis CSS (ex: `bg-primary`, `text-foreground`)
- Spacing: sistema padrão do Tailwind (ex: `p-4`, `mt-6`)
- Responsividade: mobile-first (ex: `w-full md:w-1/2 lg:w-1/3`)

---

## 🔒 Multi-Tenancy (CRÍTICO)

**NUNCA enviar `organization_id` do frontend**. O backend deriva do JWT automaticamente.

**Backend já implementa**:
- JWT contém `organizationId`
- Guards aplicam filtros automaticamente
- Repositories isolam dados por organização

**No frontend**: apenas envie dados do produto/pedido, nunca `organization_id`.

---

## ✅ Checklist de Implementação

### Sprint 3 - Portal Público

- [ ] Criar ProductGrid component
- [ ] Criar ProductCard component  
- [ ] Criar ProductFilters component
- [ ] Criar Pagination component
- [ ] Implementar página inicial (app/(public)/page.tsx)
- [ ] Implementar página de detalhes (app/(public)/products/[id]/page.tsx)
- [ ] Adicionar skeleton loaders
- [ ] Adicionar empty states
- [ ] Testar filtros (categoria, preço, ordenação)
- [ ] Testar paginação
- [ ] Responsividade mobile/tablet/desktop
- [ ] **ATUALIZAR roadmap.md** marcando Sprint 3 como ✅

---

## 📝 Após Completar a Sprint

1. **Atualizar roadmap.md**:
   ```markdown
   #### Sprint 3: Portal Público & Catálogo ✅ COMPLETO
   
   **Frontend:**
   - [x] Página inicial do marketplace
   - [x] ProductGrid e ProductCard
   - [x] ProductFilters (categoria, preço)
   - [x] Paginação
   - [x] Página de detalhes
   - [x] Skeleton loaders
   - [x] Empty states
   ```

2. **Testar manualmente**:
   - [ ] Abrir http://localhost:3000
   - [ ] Produtos aparecem no grid
   - [ ] Filtros funcionam corretamente
   - [ ] Paginação navega entre páginas
   - [ ] Clicar em produto abre detalhes
   - [ ] Responsivo em diferentes telas

3. **Avisar para próxima sprint**: Sprint 5 (Carrinho & Pedidos)

---

## 🎯 Próximas Sprints (Não implementar ainda, apenas awareness)

### Sprint 5: Completar Carrinho & Pedidos (Próxima)
- Finalizar página de carrinho
- Criar página de checkout
- Validação de estoque
- Confirmação de pedido

### Sprint 6: Logs Estruturados
- Configurar Winston
- LoggingInterceptor
- Logs JSON com métricas

### Sprint 7-9: Fase 2 - Arquitetura Avançada
- Consistência de estoque (locks pessimistas)
- Processamento assíncrono (jobs com BullMQ)
- Feature avançada (Caching distribuído recomendado)

---

## 🚨 Regras Importantes

1. **Seguir padrões do projeto** (ver coding-standards.md)
2. **Comentar apenas lógica complexa** (código deve ser auto-explicativo)
3. **Usar TypeScript strict mode** (sem `any`)
4. **Componentes shadcn/ui** têm preferência sobre custom
5. **Sempre atualizar roadmap.md** após completar tarefas
6. **Não implementar features de sprints futuras** (foco no MVP)
7. **Testar manualmente** cada feature implementada

---

## 💡 Dicas de Implementação

### ProductCard - Exemplo de estrutura:
```tsx
export function ProductCard({ product }: IProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative">
        <Image src={product.imageUrl} alt={product.name} fill />
      </div>
      <CardContent className="p-4">
        <Badge>{product.category}</Badge>
        <h3 className="font-semibold mt-2">{product.name}</h3>
        <p className="text-2xl font-bold">{formatPrice(product.price)}</p>
        <p className="text-sm text-muted-foreground">
          por {product.organization.name}
        </p>
        <Button asChild className="w-full mt-4">
          <Link href={`/products/${product.id}`}>Ver Detalhes</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Filtros - Integração com TanStack Query:
```tsx
const [filters, setFilters] = useState({
  category: '',
  minPrice: 0,
  maxPrice: 1000,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

const { data } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => api.get('/public/products', { params: filters }),
});
```

### Paginação - State management:
```tsx
const [page, setPage] = useState(1);
const pageSize = 20;

const { data } = useQuery({
  queryKey: ['products', { page, pageSize }],
  queryFn: () => api.get('/public/products', { 
    params: { page, pageSize } 
  }),
});
```

---

## 🔍 Referências Rápidas

**Documentação do Projeto**:
- Decisões técnicas: `/mnt/project/architecture-decisions.md`
- Contratos API: `/mnt/project/api-contracts.md`
- Padrões código: `/mnt/project/coding-standards.md`
- Estrutura projeto: `/mnt/project/project-structure.md`

**Docs Externas**:
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [TanStack Query](https://tanstack.com/query/latest/docs/react)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✨ Resumo Executivo

**O QUE FAZER AGORA**:
1. Implementar frontend completo do Portal Público (Sprint 3)
2. Criar components: ProductGrid, ProductCard, ProductFilters, Pagination
3. Criar páginas: Home e Product Details
4. Integrar com API `/public/products`
5. Adicionar loaders e empty states
6. Testar responsividade
7. **ATUALIZAR roadmap.md**

**O QUE NÃO FAZER**:
- ❌ Modificar backend (já está pronto)
- ❌ Implementar Sprint 5, 6 ou Fase 2 (ainda não)
- ❌ Adicionar features não solicitadas
- ❌ Quebrar padrões do projeto

**PRIORIDADE**: Entregar Sprint 3 completa e funcional.

---

**Pronto para começar?** 🚀

Foque na Sprint 3 (Portal Público). Após completar, atualize o roadmap.md e peça confirmação antes de avançar para próxima sprint.
