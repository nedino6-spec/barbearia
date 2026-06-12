# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Fazer build do React/Vite (Gera os arquivos em /dist)
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine

# Copiar os arquivos transpilados para o diretório padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar a configuração customizada do Nginx para lidar com React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
