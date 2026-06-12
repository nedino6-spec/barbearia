FROM node:20-bullseye-slim

# Instala dependências do sistema e o Chromium para o WhatsApp Web JS
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    fonts-liberation \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configura as variáveis de ambiente do Puppeteer para usar o Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copia os arquivos de configuração primeiro
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instala todas as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Gera o cliente do Prisma
RUN npx prisma generate

# Builda a aplicação Next.js
RUN npm run build

# Expõe as portas
EXPOSE 3000

# Executa o script de inicialização
RUN chmod +x start.sh
CMD ["./start.sh"]
