# =====================================================
# HOTEL PARADISE - DOCKERFILE DO BACKEND
# Versão: 1.0.0
# Descrição: Configuração da imagem Node.js para produção
# =====================================================

# Estágio 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar todas as dependências (incluindo dev)
RUN npm ci

# =====================================================
# Estágio 2: Produção
FROM node:18-alpine

# Instalar dependências do sistema necessárias
RUN apk add --no-cache tzdata curl
ENV TZ=America/Sao_Paulo

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Criar diretório da aplicação
WORKDIR /app

# Copiar dependências do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código da aplicação
COPY --chown=nodejs:nodejs . .

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "server.js"]