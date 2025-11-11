# 🔧 Guia de Configuração do Prisma Client

## ⚠️ Problema Atual

O Prisma Client não está sendo gerado devido a restrições de rede ao baixar os binários:

```
Error: Failed to fetch the engine file at
https://binaries.prisma.sh/.../schema-engine.gz - 403 Forbidden
```

---

## 🚀 Soluções

### Solução 1: Ambiente com Internet Completa (RECOMENDADO)

Execute em uma máquina com acesso total à internet:

```bash
cd back-nestjs

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Verificar se foi gerado
ls -la node_modules/.prisma/client/
```

### Solução 2: Usar Variável de Ambiente

Ignorar verificação de checksum (uso temporário):

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### Solução 3: Especificar Mirror Alternativo

Configure um mirror alternativo para os binários:

```bash
# Definir mirror
export PRISMA_BINARIES_MIRROR="https://github.com/prisma/prisma-engines/releases/download"

# Gerar cliente
npx prisma generate
```

### Solução 4: Download Manual dos Binários

1. Identifique a versão do Prisma:

```bash
npx prisma -v
# Output: prisma: 6.19.0
```

2. Baixe os binários manualmente do GitHub:
   - Acesse: https://github.com/prisma/prisma-engines/releases
   - Baixe os binários para sua plataforma

3. Coloque-os no diretório correto:

```bash
mkdir -p ~/.cache/prisma/binaries/
# Copie os binários baixados para esse diretório
```

### Solução 5: Usar Docker Multistage Build

Crie um `Dockerfile` que gera o cliente em um estágio separado:

```dockerfile
# Stage 1: Generate Prisma Client
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

### Solução 6: Usar Prisma Data Proxy (Cloud)

Para ambientes com restrições severas de rede:

1. Crie uma conta no Prisma Data Platform
2. Configure o Data Proxy
3. Use a connection string do proxy

```bash
# .env
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=xxx"
```

---

## 🧪 Validar Instalação

Após gerar o Prisma Client, execute:

```bash
# 1. Verificar arquivos gerados
ls -la node_modules/.prisma/client/

# 2. Tentar importar no Node
node -e "const { PrismaClient } = require('@prisma/client'); console.log('✅ Prisma Client OK')"

# 3. Compilar TypeScript
npx tsc --noEmit

# 4. Build da aplicação
npm run build
```

---

## 📝 Scripts Úteis

### Regenerar Cliente

```bash
# Limpar e regenerar
rm -rf node_modules/.prisma
npx prisma generate
```

### Verificar Schema

```bash
# Validar schema.prisma
npx prisma validate

# Formatar schema
npx prisma format
```

### Migrations

```bash
# Criar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Resetar banco (DEV ONLY)
npx prisma migrate reset
```

### Seed

```bash
# Popular banco com dados iniciais
npx prisma db seed
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

```bash
# Solução:
npm install @prisma/client
npx prisma generate
```

### Erro: "Module not found: Can't resolve .prisma/client"

```bash
# Solução:
rm -rf node_modules
rm package-lock.json
npm install
npx prisma generate
```

### Erro: "Environment variable not found: DATABASE_URL"

```bash
# Solução:
cp .env.example .env
# Edite .env com suas configurações
```

### Erro: "Prisma schema version mismatch"

```bash
# Solução:
npm install @prisma/client@latest prisma@latest
npx prisma generate
```

---

## 🌐 Configuração de Rede

Se estiver atrás de um proxy corporativo:

```bash
# Configurar proxy npm
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Configurar proxy para Node.js
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Tentar gerar novamente
npx prisma generate
```

---

## 📦 Alternativa: Commit do Prisma Client (Não Recomendado)

**⚠️ ATENÇÃO**: Não é recomendado versionar o Prisma Client, mas pode ser usado temporariamente:

```bash
# Remover do .gitignore temporariamente
# Edite .gitignore e comente a linha:
# node_modules/.prisma/

# Fazer commit
git add node_modules/.prisma/
git commit -m "temp: add generated prisma client"

# IMPORTANTE: Reverter depois em ambiente com internet
```

---

## ✅ Checklist de Validação

Após resolver o problema do Prisma Client:

- [ ] `node_modules/.prisma/client/` existe
- [ ] `npx prisma generate` executa sem erros
- [ ] `npx tsc --noEmit` não retorna erros
- [ ] `npm run build` compila com sucesso
- [ ] `npm run start:dev` inicia a aplicação
- [ ] Testes passam: `npm run test`
- [ ] Database está acessível
- [ ] Migrations estão aplicadas

---

## 🆘 Suporte

Se nenhuma solução funcionar:

1. Verifique firewall/proxy corporativo
2. Tente em uma rede diferente (WiFi pessoal, 4G)
3. Use um ambiente Docker sem restrições
4. Entre em contato com suporte da Prisma: https://www.prisma.io/support
5. Abra uma issue no GitHub: https://github.com/prisma/prisma/issues

---

## 📚 Recursos

- [Documentação Oficial Prisma](https://www.prisma.io/docs)
- [Prisma CLI Commands](https://www.prisma.io/docs/reference/api-reference/command-reference)
- [Troubleshooting Guide](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Prisma GitHub](https://github.com/prisma/prisma)
