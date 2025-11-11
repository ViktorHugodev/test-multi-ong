# 📚 Índice de Prompts - Marketplace Multi-ONG

## 🎯 Como Usar Este Material

Este conjunto de documentos foi criado para **otimizar o desenvolvimento** do projeto Marketplace Multi-ONG com o Claude Code. Cada arquivo tem um propósito específico:

---

## 📂 Estrutura dos Arquivos

### 1️⃣ `claude-code-prompt.md` (PRINCIPAL)
**Quando usar**: Início da Sprint 3 (Portal Público & Catálogo)

**Conteúdo**:
- ✅ Contexto resumido do projeto
- ✅ Objetivo específico da Sprint 3
- ✅ Tarefas Frontend detalhadas (6 componentes/páginas)
- ✅ Requisitos técnicos e padrões
- ✅ Checklist de implementação
- ✅ Exemplos de código
- ✅ Instruções para atualizar roadmap.md

**Próximo passo após completar**: Abrir `claude-code-prompt-sprints-futuras.md` para Sprint 5

---

### 2️⃣ `claude-code-prompt-sprints-futuras.md` (SEQUENCIAL)
**Quando usar**: Após completar Sprint 3, 5, 6

**Conteúdo**:
- ✅ Sprint 5: Carrinho & Pedidos (Backend + Frontend)
- ✅ Sprint 6: Logs & Observabilidade
- ✅ Sprint 7-9: Fase 2 - Arquitetura Avançada (Opcional)

**Estrutura de cada sprint**:
- Contexto do que já está pronto
- Tarefas Backend (com código de exemplo)
- Tarefas Frontend (com código de exemplo)
- Checklist completo
- Instruções para atualizar roadmap.md

---

### 3️⃣ `claude-code-guia-rapido.md` (REFERÊNCIA CONSTANTE)
**Quando usar**: Durante todo o desenvolvimento (consulta)

**Conteúdo**:
- ✅ Workflow de desenvolvimento
- ✅ Code templates (components, pages, forms)
- ✅ Padrões de código (TypeScript, imports, naming)
- ✅ Styling guidelines (Tailwind, shadcn/ui)
- ✅ Security & Multi-tenancy
- ✅ Utils úteis (formatação, validação, debounce)
- ✅ Testing reference
- ✅ Troubleshooting comum
- ✅ Commit messages guidelines
- ✅ Links úteis
- ✅ Tips & Tricks

---

## 🗺️ Roadmap Visual

```
┌────────────────────────────────────────────────────────────┐
│  FASE 0: Setup & Infraestrutura  ✅ COMPLETO               │
└────────────────────────────────────────────────────────────┘
                          ⬇️
┌────────────────────────────────────────────────────────────┐
│  FASE 1: MVP - Etapa 1 (🟡 70% COMPLETO)                  │
├────────────────────────────────────────────────────────────┤
│  ✅ Sprint 1: Auth & Multi-Tenancy                         │
│  ✅ Sprint 2: CRUD Produtos                                │
│  🟡 Sprint 3: Portal Público ← VOCÊ ESTÁ AQUI              │
│  ✅ Sprint 4: Busca Inteligente                            │
│  🟡 Sprint 5: Carrinho & Pedidos                           │
│  ⏳ Sprint 6: Logs                                          │
└────────────────────────────────────────────────────────────┘
                          ⬇️
┌────────────────────────────────────────────────────────────┐
│  FASE 2: Arquitetura Avançada (⏳ PENDENTE)               │
├────────────────────────────────────────────────────────────┤
│  ⏳ Sprint 7: Consistência de Estoque                      │
│  ⏳ Sprint 8: Processamento Assíncrono                     │
│  ⏳ Sprint 9: Feature Avançada (Caching)                   │
└────────────────────────────────────────────────────────────┘
                          ⬇️
┌────────────────────────────────────────────────────────────┐
│  FASE 3: Testes & Documentação (⏳ PENDENTE)              │
├────────────────────────────────────────────────────────────┤
│  ⏳ Sprint 10: Testes E2E                                  │
│  ⏳ Sprint 11: Documentação Final                          │
│  ⏳ Sprint 12: Polish & Submission                         │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Para Claude Code - Sprint 3 (AGORA)

**1. Abrir arquivo principal**:
```
/mnt/user-data/outputs/claude-code-prompt.md
```

**2. Ler seção "Objetivo da Sprint Atual"**

**3. Implementar tarefas Frontend**:
- [ ] ProductGrid component
- [ ] ProductCard component
- [ ] ProductFilters component
- [ ] Pagination component
- [ ] Página inicial (home)
- [ ] Página de detalhes do produto

**4. Durante desenvolvimento, consultar**:
```
/mnt/user-data/outputs/claude-code-guia-rapido.md
```
Para templates, padrões, e troubleshooting.

**5. Ao finalizar**:
- ✅ Testar manualmente
- ✅ Atualizar `/mnt/project/roadmap.md`
- ✅ Commit com mensagem descritiva
- ✅ Perguntar sobre próxima sprint

**6. Próxima sprint (Sprint 5)**:
```
/mnt/user-data/outputs/claude-code-prompt-sprints-futuras.md
```

---

## 📋 Checklist Macro do Projeto

### ✅ Fase 0: Setup (COMPLETO)
- [x] Docker Compose
- [x] Backend NestJS configurado
- [x] Frontend Next.js configurado
- [x] Prisma + PostgreSQL
- [x] Redis + Bull/BullMQ

### 🟡 Fase 1: MVP (70% COMPLETO)
- [x] Sprint 1: Auth & Multi-Tenancy
- [x] Sprint 2: CRUD Produtos
- [ ] Sprint 3: Portal Público ← **FOCO ATUAL**
- [x] Sprint 4: Busca Inteligente
- [ ] Sprint 5: Carrinho & Pedidos (40% completo)
- [ ] Sprint 6: Logs

### ⏳ Fase 2: Arquitetura Avançada (PENDENTE)
- [ ] Sprint 7: Consistência de Estoque
- [ ] Sprint 8: Processamento Assíncrono
- [ ] Sprint 9: Feature Avançada (Caching)

### ⏳ Fase 3: Testes & Docs (PENDENTE)
- [ ] Sprint 10: Testes E2E
- [ ] Sprint 11: Documentação Final
- [ ] Sprint 12: Polish & Submission

---

## 🎯 Prioridades por Sprint

### Sprint 3 (ALTA PRIORIDADE - AGORA)
**Objetivo**: Consumidores podem navegar e visualizar produtos

**Entregas**:
- Home page com grid de produtos
- Filtros (categoria, preço, ordenação)
- Paginação
- Página de detalhes
- Loading/empty states

**Tempo estimado**: 1-2 dias

---

### Sprint 5 (ALTA PRIORIDADE - PRÓXIMA)
**Objetivo**: Consumidores podem comprar produtos

**Entregas**:
- Página de carrinho completa
- Página de checkout com formulário
- Validação de estoque (backend)
- Criação de pedidos
- Página de sucesso

**Tempo estimado**: 2-3 dias

---

### Sprint 6 (MÉDIA PRIORIDADE)
**Objetivo**: Observabilidade do sistema

**Entregas**:
- Winston logger configurado
- LoggingInterceptor global
- Logs estruturados (JSON)
- Logs específicos (auth, orders, search)

**Tempo estimado**: 1 dia

---

### Sprints 7-9 (BAIXA PRIORIDADE - OPCIONAL)
**Objetivo**: Demonstrar expertise senior

**Entregas**:
- Locks pessimistas em estoque
- Jobs assíncronos (BullMQ)
- Cache distribuído (Redis)
- Dead Letter Queues
- Retry strategies

**Tempo estimado**: 3-5 dias

---

## 📚 Documentação de Referência

### Arquivos do Projeto
Localizados em `/mnt/project/`:

1. **architecture-decisions.md** (1187 linhas)
   - ADR-001: Technology Stack
   - ADR-002: Multi-Tenancy Strategy
   - ADR-003: ORM Selection (Prisma vs TypeORM)
   - ADR-004: Authentication Strategy
   - ADR-005: Search Implementation
   - ADR-006: Async Processing

2. **api-contracts.md** (938 linhas)
   - Todos os endpoints documentados
   - Request/Response formats
   - Error codes
   - Authentication headers

3. **coding-standards.md**
   - TypeScript conventions
   - Naming patterns
   - Import order
   - Component structure

4. **project-structure.md**
   - Folder organization
   - Module architecture
   - Layer separation

5. **roadmap.md** (933 linhas)
   - Status detalhado de cada sprint
   - Checklist completo
   - Progresso visual
   - Próximos passos

---

## 💡 Tips de Uso

### Para o Claude Code

1. **Leia o prompt principal primeiro**
   - Entenda o contexto completo
   - Veja exemplos de código
   - Note os padrões específicos

2. **Consulte o guia rápido frequentemente**
   - Templates para components/pages
   - Utils comuns (formatPrice, debounce)
   - Troubleshooting

3. **Sempre atualize o roadmap.md**
   - Marque tarefas como ✅
   - Atualizar progresso %
   - Documentar o que foi feito

4. **Siga os padrões rigorosamente**
   - Export function para components
   - Arrow function para pages
   - Naming conventions
   - Import order

5. **Teste antes de considerar pronto**
   - Teste manual de todas as features
   - Responsividade (mobile/tablet/desktop)
   - Loading/error/empty states

---

## 🚨 Avisos Importantes

### ⚠️ Multi-Tenancy é CRÍTICO
- NUNCA enviar `organization_id` do frontend
- Backend deriva do JWT automaticamente
- Testar isolamento rigorosamente

### ⚠️ Qualidade > Velocidade
- Este é um teste senior
- Código bem estruturado é prioridade
- Documentação clara e concisa

### ⚠️ Atualizar Roadmap
- Após cada tarefa/sprint completa
- Marcar ✅ no checklist
- Atualizar porcentagem de progresso

### ⚠️ Não Pular Sprints
- Completar Sprint 3 antes da 5
- Completar Sprint 5 antes da 6
- Fase 1 completa antes da Fase 2

---

## 📞 Quando Usar Cada Arquivo

| Situação | Arquivo | Seção |
|----------|---------|-------|
| Iniciar Sprint 3 | `claude-code-prompt.md` | Toda |
| Dúvida de código | `claude-code-guia-rapido.md` | Code Templates |
| Dúvida de padrão | `claude-code-guia-rapido.md` | Quick Reference |
| Erro/Bug | `claude-code-guia-rapido.md` | Troubleshooting |
| Instalar dependência | `claude-code-guia-rapido.md` | Instalação |
| Commit | `claude-code-guia-rapido.md` | Commit Guidelines |
| Próxima sprint | `claude-code-prompt-sprints-futuras.md` | Sprint X |
| Decisão arquitetural | `/mnt/project/architecture-decisions.md` | ADR-X |
| Contrato API | `/mnt/project/api-contracts.md` | Endpoints |
| Ver progresso | `/mnt/project/roadmap.md` | Checklist |

---

## ✨ Resumo Executivo

**AGORA (Sprint 3)**:
1. Abrir `claude-code-prompt.md`
2. Implementar 6 componentes/páginas do frontend
3. Testar manualmente
4. Atualizar roadmap.md
5. Perguntar sobre Sprint 5

**PRÓXIMO (Sprint 5)**:
1. Abrir `claude-code-prompt-sprints-futuras.md`
2. Implementar carrinho & checkout
3. Validar estoque no backend
4. Testar fluxo de compra
5. Atualizar roadmap.md

**REFERÊNCIA (Sempre)**:
- `claude-code-guia-rapido.md` para consultas rápidas
- `/mnt/project/*` para decisões e contratos

---

## 🎓 Próximos Passos

### Imediato (Hoje)
1. Ler `claude-code-prompt.md` completo
2. Iniciar Sprint 3
3. Implementar ProductCard e ProductGrid
4. Testar componentes isoladamente

### Curto Prazo (Esta Semana)
5. Completar Sprint 3 (Portal Público)
6. Completar Sprint 5 (Carrinho & Pedidos)
7. Implementar Sprint 6 (Logs)

### Médio Prazo (Próxima Semana)
8. Implementar Fase 2 (Arquitetura Avançada)
9. Testes E2E abrangentes
10. Documentação final

### Longo Prazo (Submissão)
11. Polish geral
12. README completo
13. Screenshots
14. Deploy (se aplicável)

---

**Boa sorte! 🚀**

Lembre-se: este material foi criado para **maximizar sua eficiência**. Use-o como referência constante durante o desenvolvimento.

---

**Última Atualização**: 2025-11-11  
**Versão**: 1.0.0  
**Autor**: Tech Lead Senior
