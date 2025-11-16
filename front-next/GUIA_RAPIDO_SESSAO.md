# ⚡ Guia Rápido - Resolver Erro 401 (Token Expirando)

## 🎯 Problema
Após pouco tempo de uso, o backend retorna erro 401 Unauthorized.

## ✅ Solução Implementada

### 1. **Configuração Atualizada**

Arquivo `.env.local` agora tem:
```bash
SESSION_MAX_AGE=2592000  # 30 dias
JWT_MAX_AGE=2592000      # 30 dias
```

Arquivo `src/auth.config.ts` agora usa essas variáveis.

---

## 🚀 Como Aplicar (3 Passos)

### Passo 1: Verificar `.env.local`
```bash
# Abrir o arquivo
cat .env.local

# Verificar se tem estas linhas:
SESSION_MAX_AGE=2592000
JWT_MAX_AGE=2592000
```

✅ **Já está configurado!** As variáveis já foram adicionadas.

### Passo 2: Reiniciar o Servidor
```bash
# Parar o servidor (Ctrl+C no terminal)
# Depois iniciar novamente:
npm run dev
```

### Passo 3: Fazer Logout e Login
1. Acesse a aplicação
2. Faça logout
3. Faça login novamente
4. O novo token terá 30 dias de validade

---

## 🔧 Ajustar o Tempo (Opcional)

Se quiser um tempo diferente, edite `.env.local`:

### Opção 1: 7 dias (Recomendado para Produção)
```bash
SESSION_MAX_AGE=604800
JWT_MAX_AGE=604800
```

### Opção 2: 1 dia (Desenvolvimento)
```bash
SESSION_MAX_AGE=86400
JWT_MAX_AGE=86400
```

### Opção 3: 1 hora (Máxima Segurança)
```bash
SESSION_MAX_AGE=3600
JWT_MAX_AGE=3600
```

Depois de editar, **reinicie o servidor** e **faça login novamente**.

---

## 📊 Tabela de Tempos

| Tempo     | Segundos | Quando Usar                    |
|-----------|----------|--------------------------------|
| 1 hora    | 3600     | Aplicações muito sensíveis     |
| 1 dia     | 86400    | Desenvolvimento/Testes         |
| 7 dias    | 604800   | **Produção (Recomendado)**     |
| 30 dias   | 2592000  | Uso intenso/Conveniência       |

---

## ✅ Como Verificar se Funcionou

### Teste 1: Verificar Configuração
```bash
# No terminal, dentro da pasta front-next
grep SESSION_MAX_AGE .env.local
grep JWT_MAX_AGE .env.local
```

Deve mostrar:
```
SESSION_MAX_AGE=2592000
JWT_MAX_AGE=2592000
```

### Teste 2: Verificar no Navegador
1. Faça login
2. Abra DevTools (F12)
3. Vá em Application → Cookies
4. Procure por `next-auth.session-token`
5. Verifique a data de expiração

### Teste 3: Usar a Aplicação
1. Faça login
2. Use a aplicação normalmente
3. Deixe aberto por algumas horas
4. Tente acessar `/api/orders`
5. **Não deve dar erro 401**

---

## 🐛 Se Ainda Não Funcionar

### Solução 1: Limpar Cache
```bash
# Parar o servidor
# Limpar cache do Next.js
rm -rf .next

# Iniciar novamente
npm run dev
```

### Solução 2: Limpar Cookies do Navegador
1. DevTools (F12)
2. Application → Cookies
3. Clicar com botão direito → Clear
4. Fazer login novamente

### Solução 3: Verificar Backend
O backend também pode ter configuração de expiração de token.
Verifique o arquivo de configuração do backend (NestJS).

---

## 📝 Resumo

✅ **Já Implementado:**
- Variáveis de ambiente adicionadas
- Configuração do NextAuth atualizada
- Tempo padrão: 30 dias

🔄 **Você Precisa Fazer:**
1. Reiniciar o servidor (`npm run dev`)
2. Fazer logout e login novamente
3. Testar se não dá mais erro 401

⚙️ **Opcional:**
- Ajustar o tempo em `.env.local`
- Reiniciar após mudanças

---

## 📞 Próximos Passos

Se o erro persistir, pode ser:
1. **Backend**: Verificar configuração de JWT no NestJS
2. **Middleware**: Verificar se está propagando o token corretamente
3. **CORS**: Verificar configurações de CORS entre front e back

Consulte `CONFIGURACAO_SESSAO.md` para mais detalhes.

---

**Status:** ✅ Configuração Implementada  
**Ação Necessária:** Reiniciar servidor e fazer login novamente
