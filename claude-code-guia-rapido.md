# 📚 Guia Rápido de Referência - Claude Code

## 🎯 Workflow de Desenvolvimento

### 1️⃣ Antes de Começar uma Sprint
```bash
# Verificar status do projeto
cd marketplace-multi-ong

# Ver roadmap atual
cat /mnt/project/roadmap.md | head -50

# Verificar servidores rodando
lsof -i:3333  # Backend
lsof -i:3000  # Frontend
```

### 2️⃣ Durante o Desenvolvimento
```bash
# Iniciar backend (se não estiver rodando)
cd back-nestjs
npm run start:dev

# Iniciar frontend (se não estiver rodando)
cd front-next
npm run dev

# Prisma Studio (visualizar dados)
cd back-nestjs
npx prisma studio
```

### 3️⃣ Após Completar Tarefas
1. **Testar manualmente**
2. **Atualizar roadmap.md** (marcar como ✅)
3. **Commit com mensagem descritiva**
4. **Avisar o que foi feito e perguntar próxima sprint**

---

## 🔍 Quick Reference - Padrões do Projeto

### Estrutura de Arquivos

```
front-next/src/
├── app/
│   ├── (auth)/           # Páginas de autenticação
│   ├── (public)/         # Páginas públicas (marketplace)
│   └── (dashboard)/      # Área restrita (ONG)
│
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Header, Footer, etc.
│   ├── auth/             # Login, Register forms
│   ├── products/         # Product-related components
│   └── cart/             # Cart-related components
│
├── lib/
│   ├── api/              # API client (axios)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   └── validations/      # Zod schemas
│
└── types/                # TypeScript types/interfaces
```

---

## 💻 Code Templates

### 1. Component Template (Export Function)

```tsx
// components/products/product-card.tsx
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types';

interface IProductCardProps {
  product: Product;
}

export function ProductCard({ product }: IProductCardProps) {
  return (
    <Card>
      <CardContent>
        {/* Implementation */}
      </CardContent>
    </Card>
  );
}
```

### 2. Page Template (Arrow Function)

```tsx
// app/(public)/products/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product } from '@/types';

const ProductsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/public/products'),
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Produtos</h1>
      {/* Implementation */}
    </div>
  );
};

export default ProductsPage;
```

### 3. API Integration (TanStack Query)

```tsx
// Hook personalizado
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get('/public/products', { params: filters }),
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (orderData) => api.post('/orders', orderData),
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

### 4. Form com Zod + React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

type TLoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<TLoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = (data: TLoginForm) => {
    // Handle login
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 🎨 Styling Guidelines

### Tailwind Classes - Padrões Comuns

```tsx
// Container
<div className="container mx-auto px-4 py-8">

// Grid Responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Card
<div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">

// Button Primary
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">

// Text Hierarchy
<h1 className="text-4xl font-bold">       // Page title
<h2 className="text-2xl font-semibold">  // Section title
<h3 className="text-xl font-medium">     // Subsection
<p className="text-base text-muted-foreground">  // Body text
```

### shadcn/ui Components

```tsx
// Sempre preferir shadcn/ui quando disponível
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
```

---

## 🔐 Security & Multi-Tenancy

### Frontend - O QUE FAZER

✅ **Enviar apenas dados necessários**:
```tsx
const orderData = {
  items: cartItems.map(item => ({
    productId: item.product.id,
    quantity: item.quantity,
  })),
  notes: 'Entrega pela manhã',
};

await api.post('/orders', orderData);
```

❌ **NUNCA enviar `organization_id`**:
```tsx
// ❌ ERRADO - Backend deriva do JWT
const productData = {
  name: 'Produto',
  organizationId: '123', // NUNCA FAZER ISSO!
};
```

### Backend - Multi-Tenancy já implementado

✅ **Guards aplicam filtros automaticamente**:
```typescript
// NestJS Controller
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Get()
async findAll(@CurrentOrganization() orgId: string) {
  return this.productService.findAll(orgId);
}
```

✅ **Decorators customizados**:
- `@CurrentUser()` - Retorna usuário autenticado
- `@CurrentOrganization()` - Retorna organization_id do token
- `@Public()` - Permite acesso sem autenticação

---

## 🛠️ Utils Úteis

### Formatação de Moeda

```typescript
// lib/utils/format.ts
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

// Uso
<p>{formatPrice(product.price)}</p>  // "R$ 99,90"
```

### Validação de CPF/CNPJ

```typescript
// lib/utils/validators.ts
export function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  // ... lógica de validação
}
```

### Debounce para Search

```typescript
// hooks/use-debounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// Uso
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  // Buscar quando debouncedSearch mudar
}, [debouncedSearch]);
```

---

## 🧪 Testing Quick Reference

### Teste E2E (Backend)

```typescript
// test/products.e2e-spec.ts
describe('Products (e2e)', () => {
  it('should list only products from user organization', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data.every(p => p.organizationId === orgId)).toBe(true);
  });
});
```

### Teste Unitário (Frontend)

```typescript
// components/product-card.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  it('should render product name', () => {
    const product = { id: '1', name: 'Test Product', price: 100 };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

---

## 📦 Instalação de Dependências

### Backend (NestJS)

```bash
# Core
npm install @nestjs/common @nestjs/core @nestjs/platform-express

# Database
npm install @prisma/client
npm install -D prisma

# Auth
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt

# Validation
npm install class-validator class-transformer

# Queue
npm install @nestjs/bull bull bullmq

# Logging
npm install winston nest-winston
```

### Frontend (Next.js)

```bash
# Core
npm install react react-dom next

# UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select

# State Management
npm install @tanstack/react-query zustand

# Forms
npm install react-hook-form @hookform/resolvers zod

# HTTP
npm install axios

# Utils
npm install lucide-react clsx tailwind-merge
```

---

## 🚨 Troubleshooting Comum

### Erro: "Port already in use"

```bash
# Verificar o que está rodando na porta
lsof -i:3000

# Matar processo
kill -9 <PID>
```

### Erro: Prisma não encontra database

```bash
# Resetar database
cd back-nestjs
npx prisma migrate reset

# Rodar migrations
npx prisma migrate dev

# Seed
npm run seed
```

### Erro: shadcn/ui component não encontrado

```bash
# Adicionar component faltando
npx shadcn-ui@latest add <component-name>

# Exemplo
npx shadcn-ui@latest add dialog
```

### Erro: CORS no frontend

**Verificar backend** (`back-nestjs/src/main.ts`):
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

---

## 📝 Commit Messages Guidelines

```bash
# Formato: <tipo>: <descrição>

# Tipos:
feat: Nova feature
fix: Bug fix
refactor: Refatoração de código
style: Mudanças de estilo (formatação)
docs: Documentação
test: Adicionar testes
chore: Tarefas de build, dependências

# Exemplos:
git commit -m "feat: adicionar ProductCard component"
git commit -m "fix: corrigir validação de estoque em OrderService"
git commit -m "docs: atualizar roadmap.md - Sprint 3 completa"
```

---

## 🎯 Checklist Antes de Considerar Sprint Completa

- [ ] Código compila sem erros
- [ ] ESLint sem warnings críticos
- [ ] Teste manual de todas as features
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Loading states implementados
- [ ] Error states implementados
- [ ] Empty states implementados
- [ ] roadmap.md atualizado
- [ ] Commit realizado
- [ ] README atualizado (se aplicável)

---

## 📚 Links Úteis

### Documentação
- [NestJS](https://docs.nestjs.com/)
- [Next.js 14](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod](https://zod.dev/)

### Tools
- [Prisma Studio](http://localhost:5555) - Database viewer
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools) (para Zustand)

---

## 💡 Tips & Tricks

### 1. Usar Aliases de Import

```tsx
// ✅ Com alias
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

// ❌ Sem alias (não fazer)
import { Button } from '../../../components/ui/button';
```

### 2. Extrair Constantes

```tsx
// constants/categories.ts
export const PRODUCT_CATEGORIES = [
  'Artesanato',
  'Alimentos',
  'Vestuário',
  'Livros',
  'Outros',
] as const;

export type TProductCategory = typeof PRODUCT_CATEGORIES[number];
```

### 3. Usar Enums (TypeScript)

```typescript
// types/order.ts
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}
```

### 4. Error Boundaries (React)

```tsx
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
      <button onClick={() => reset()}>Tentar novamente</button>
    </div>
  );
}
```

---

## 🎓 Boas Práticas - Checklist

### Frontend
- [ ] Componentes pequenos e reutilizáveis
- [ ] Usar TypeScript strict mode (sem `any`)
- [ ] Loading, error e empty states sempre
- [ ] Validação de formulários (Zod)
- [ ] Debounce em search inputs
- [ ] Otimizar imagens (Next.js Image component)
- [ ] Acessibilidade (ARIA labels, semantic HTML)

### Backend
- [ ] DTOs para todas as rotas
- [ ] Validação de entrada (class-validator)
- [ ] Guards para autenticação e autorização
- [ ] Tratamento de erros adequado
- [ ] Logs estruturados (JSON)
- [ ] Transações para operações críticas
- [ ] Testes unitários para lógica de negócio

### Geral
- [ ] Código auto-explicativo (menos comentários)
- [ ] Nomenclatura consistente
- [ ] DRY (Don't Repeat Yourself)
- [ ] SOLID principles
- [ ] Git commits descritivos
- [ ] README atualizado

---

**Pronto para começar? 🚀**

Lembre-se: qualidade > velocidade. Este é um teste senior, então capriche nos detalhes!
