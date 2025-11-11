# 📚 Prompts Complementares - Sprints Futuras

## 🎯 Sprint 5: Carrinho & Pedidos (Próxima após Sprint 3)

### Contexto
Backend já possui:
- ✅ Módulo de Orders
- ✅ OrderRepository e OrderService
- ✅ Endpoints básicos criados
- ⚠️ Falta: validação de estoque, cálculo de totais, snapshot de preços

Frontend já possui:
- ✅ Hook useCart (Zustand) com localStorage
- ✅ Página de carrinho básica
- ⚠️ Falta: UI completa, checkout, confirmação

### Objetivo
Permitir usuários finalizarem compras com carrinho funcional, checkout e confirmação de pedido.

---

### Tarefas Backend

#### 1. Aprimorar OrderService
**Arquivo**: `back-nestjs/src/modules/orders/order.service.ts`

**Adicionar**:
```typescript
async createOrder(customerId: string, items: OrderItem[]): Promise<Order> {
  return this.prisma.$transaction(async (tx) => {
    // 1. Validar estoque de cada item
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stockQty: true, price: true },
      });
      
      if (!product || product.stockQty < item.quantity) {
        throw new BadRequestException(`Estoque insuficiente para produto ${item.productId}`);
      }
    }
    
    // 2. Calcular totais com preços atuais (snapshot)
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price, // SNAPSHOT do preço atual
          totalPrice: product.price * item.quantity,
        };
      })
    );
    
    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // 3. Gerar order_number único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // 4. Criar pedido
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        status: 'pending',
        totalAmount,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: { organization: true },
            },
          },
        },
      },
    });
    
    // 5. Decrementar estoque (CRITICAL)
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } },
      });
    }
    
    return order;
  }, {
    isolationLevel: 'Serializable', // IMPORTANTE: previne race conditions
  });
}
```

#### 2. Adicionar validações
**DTO**: `back-nestjs/src/modules/orders/dto/create-order.dto.ts`

```typescript
import { IsArray, ArrayMinSize, ValidateNested, IsInt, Min, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Pedido deve conter ao menos 1 item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
```

#### 3. Atualizar Controller
**Arquivo**: `back-nestjs/src/modules/orders/order.controller.ts`

```typescript
@Post()
async create(
  @Body() createOrderDto: CreateOrderDto,
  @CurrentUser() user: User,
) {
  return this.orderService.createOrder(user.id, createOrderDto.items);
}

@Get('my-orders')
async getMyOrders(@CurrentUser() user: User) {
  return this.orderService.findByCustomer(user.id);
}

@Get(':id')
async getOrder(@Param('id') id: string, @CurrentUser() user: User) {
  const order = await this.orderService.findOne(id);
  
  // Verificar se pedido pertence ao usuário
  if (order.customerId !== user.id) {
    throw new ForbiddenException('Você não tem permissão para visualizar este pedido');
  }
  
  return order;
}
```

---

### Tarefas Frontend

#### 1. Página de Carrinho Completa
**Arquivo**: `front-next/src/app/(public)/cart/page.tsx`

**Features**:
- Lista de itens no carrinho (useCart)
- CartItem component por item:
  - Imagem do produto
  - Nome e categoria
  - Preço unitário e total
  - Controles de quantidade (+/-)
  - Botão remover
- CartSummary:
  - Subtotal
  - Frete (se aplicável)
  - Total
- Botões:
  - "Continuar Comprando" (link para home)
  - "Finalizar Compra" (link para checkout)
- Empty state: "Carrinho vazio" com CTA

#### 2. CartItem Component
**Arquivo**: `front-next/src/components/cart/cart-item.tsx`

```tsx
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/hooks/use-cart';
import { formatPrice } from '@/lib/utils';

interface ICartItemProps {
  item: CartItem;
}

export function CartItem({ item }: ICartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  
  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="relative w-24 h-24">
        <Image 
          src={item.product.imageUrl} 
          alt={item.product.name}
          fill
          className="object-cover rounded"
        />
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">{item.product.category}</p>
        <p className="font-bold mt-2">{formatPrice(item.product.price)}</p>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => removeItem(item.product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="w-8 text-center">{item.quantity}</span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="font-bold">
          {formatPrice(item.product.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}
```

#### 3. Página de Checkout
**Arquivo**: `front-next/src/app/(public)/checkout/page.tsx`

**Features**:
- Resumo do pedido (lista de itens + total)
- Formulário de dados de entrega:
  - Nome completo
  - Email
  - Telefone
  - Endereço (rua, número, complemento, bairro, cidade, estado, CEP)
- Validação com Zod + React Hook Form
- Botão "Finalizar Pedido"
- Loading state durante criação do pedido
- Redirect para página de sucesso

**Estrutura**:
```tsx
'use client';

import { useCart } from '@/lib/hooks/use-cart';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.object({
    street: z.string().min(3),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/),
  }),
});

type TCheckoutForm = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const { items, clearCart } = useCart();
  const router = useRouter();
  
  const form = useForm<TCheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });
  
  const createOrderMutation = useMutation({
    mutationFn: (data: TCheckoutForm) => {
      return api.post('/orders', {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        // Adicionar dados de entrega se necessário
      });
    },
    onSuccess: (response) => {
      clearCart();
      router.push(`/order-success/${response.data.id}`);
    },
  });
  
  const onSubmit = (data: TCheckoutForm) => {
    createOrderMutation.mutate(data);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulário de entrega */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Campos do formulário */}
        </form>
        
        {/* Resumo do pedido */}
        <div>
          <OrderSummary items={items} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
```

#### 4. Página de Sucesso
**Arquivo**: `front-next/src/app/(public)/order-success/[orderId]/page.tsx`

**Features**:
- Mensagem de sucesso
- Número do pedido
- Resumo dos itens
- Botões:
  - "Ver Meus Pedidos"
  - "Continuar Comprando"

---

### Checklist Sprint 5

**Backend**:
- [ ] Aprimorar OrderService.createOrder com:
  - [ ] Validação de estoque
  - [ ] Cálculo de totais
  - [ ] Snapshot de preços
  - [ ] Geração de order_number único
  - [ ] Transação com isolamento Serializable
  - [ ] Decremento de estoque
- [ ] Criar/atualizar CreateOrderDto com validações
- [ ] Atualizar OrderController
- [ ] Adicionar endpoint GET /orders/my-orders
- [ ] Adicionar endpoint GET /orders/:id

**Frontend**:
- [ ] Finalizar página de carrinho
- [ ] Criar CartItem component completo
- [ ] Criar CartSummary component
- [ ] Criar página de checkout
- [ ] Implementar formulário de dados de entrega (Zod + React Hook Form)
- [ ] Criar página de sucesso
- [ ] Criar página "Meus Pedidos" (opcional)
- [ ] Integrar com API POST /orders
- [ ] Testar fluxo completo: adicionar ao carrinho → checkout → sucesso

**Testes**:
- [ ] Teste E2E: Adicionar produto ao carrinho
- [ ] Teste E2E: Atualizar quantidade no carrinho
- [ ] Teste E2E: Remover item do carrinho
- [ ] Teste E2E: Criar pedido
- [ ] Teste: Validação de estoque (tentar comprar mais que disponível)
- [ ] Teste: Snapshot de preços (preço do pedido != preço atual do produto)

**Atualizar**:
- [ ] **roadmap.md**: Marcar Sprint 5 como ✅

---

## 🎯 Sprint 6: Logs & Observabilidade

### Objetivo
Implementar logging estruturado (JSON) para todas as operações críticas.

### Backend Tasks

#### 1. Configurar Winston
**Arquivo**: `back-nestjs/src/config/logger.config.ts`

```typescript
import * as winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

#### 2. Criar LoggingInterceptor
**Arquivo**: `back-nestjs/src/common/interceptors/logging.interceptor.ts`

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logger } from '@/config/logger.config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const startTime = Date.now();
    const correlationId = request.headers['x-correlation-id'] || this.generateCorrelationId();
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const latency = Date.now() - startTime;
          
          logger.info({
            timestamp: new Date().toISOString(),
            method,
            url,
            statusCode: response.statusCode,
            latency: `${latency}ms`,
            userId: user?.id,
            organizationId: user?.organizationId,
            correlationId,
          });
        },
        error: (error) => {
          const latency = Date.now() - startTime;
          
          logger.error({
            timestamp: new Date().toISOString(),
            method,
            url,
            error: error.message,
            stack: error.stack,
            latency: `${latency}ms`,
            userId: user?.id,
            organizationId: user?.organizationId,
            correlationId,
          });
        },
      }),
    );
  }
  
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### 3. Aplicar Globalmente
**Arquivo**: `back-nestjs/src/main.ts`

```typescript
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // ... configurações existentes
  
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // ...
}
```

#### 4. Logs Específicos

**Auth logs** (em `auth.service.ts`):
```typescript
import { logger } from '@/config/logger.config';

async login(email: string, password: string) {
  const user = await this.findByEmail(email);
  
  if (!user) {
    logger.warn({ event: 'login_failed', email, reason: 'user_not_found' });
    throw new UnauthorizedException('Credenciais inválidas');
  }
  
  // ...
  
  logger.info({ 
    event: 'login_success', 
    userId: user.id, 
    organizationId: user.organizationId 
  });
  
  return { access_token };
}
```

**Order logs** (em `order.service.ts`):
```typescript
async createOrder(customerId: string, items: OrderItem[]) {
  logger.info({ 
    event: 'order_creation_started', 
    customerId, 
    itemCount: items.length 
  });
  
  try {
    const order = await this.prisma.$transaction(/* ... */);
    
    logger.info({ 
      event: 'order_created', 
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId,
      totalAmount: order.totalAmount,
    });
    
    return order;
  } catch (error) {
    logger.error({ 
      event: 'order_creation_failed', 
      customerId, 
      error: error.message 
    });
    throw error;
  }
}
```

---

### Checklist Sprint 6

**Backend**:
- [ ] Instalar winston (`npm install winston`)
- [ ] Criar logger.config.ts
- [ ] Criar LoggingInterceptor
- [ ] Aplicar interceptor globalmente
- [ ] Adicionar logs em auth.service.ts
- [ ] Adicionar logs em order.service.ts
- [ ] Adicionar logs em product.service.ts
- [ ] Configurar rotação de logs (opcional)
- [ ] Criar pasta `logs/` no .gitignore

**Validação**:
- [ ] Verificar formato JSON nos arquivos de log
- [ ] Confirmar presença de campos: timestamp, method, url, statusCode, latency, userId, organizationId
- [ ] Testar logs de erro (forçar erro e verificar stack trace)

**Atualizar**:
- [ ] **roadmap.md**: Marcar Sprint 6 como ✅
- [ ] README.md: Adicionar seção sobre logs

---

## 🚀 Fase 2: Arquitetura Avançada (Opcional - Diferencial Senior)

**Sprints 7-9 são opcionais, mas fortemente recomendadas para demonstrar expertise senior.**

### Sprint 7: Consistência de Estoque (Alta Prioridade)

**Objetivo**: Garantir que não haja overselling mesmo com múltiplos usuários comprando simultaneamente.

**Implementação**: Ver arquivo `project-structure.md` - Seção "Concurrency Control".

**Tasks**:
- [ ] Implementar pessimistic locking em OrderService
- [ ] Usar transações com isolamento Serializable
- [ ] Adicionar retry mechanism para deadlocks
- [ ] Testes de carga: 10 usuários tentando comprar o último item

---

### Sprint 8: Processamento Assíncrono

**Objetivo**: Mover operações demoradas (emails, notificações) para filas assíncronas.

**Implementação**: Ver arquivo `project-structure.md` - Seção "Async Jobs".

**Tasks**:
- [ ] Configurar BullMQ
- [ ] Criar jobs: SendOrderConfirmationEmailJob, NotifyOngNewOrderJob
- [ ] Implementar workers
- [ ] Dead Letter Queue para falhas
- [ ] Retry strategies (exponential backoff)
- [ ] Dashboard de filas (Bull Board)

---

### Sprint 9: Feature Avançada - Caching Distribuído (Recomendado)

**Objetivo**: Melhorar performance com cache em Redis.

**Implementação**:
- Cache de produtos mais visualizados (TTL: 5 min)
- Cache de categorias (TTL: 1 hora)
- Cache-aside pattern
- Invalidação de cache ao atualizar produto

---

## 📌 Observações Finais

1. **Sempre atualize roadmap.md** após completar cada sprint
2. **Documente decisões técnicas** em architecture-decisions.md (se aplicável)
3. **Teste manualmente** cada feature antes de considerar completa
4. **Commit frequente** com mensagens descritivas
5. **Priorize qualidade** sobre velocidade - este é um teste senior

**Boa sorte! 🚀**
