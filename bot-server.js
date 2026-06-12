const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Inicializa o cliente do WhatsApp (salva a sessão localmente para não pedir QR code toda hora)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const qrPath = path.join(__dirname, 'public', 'qr.png');

console.log('Iniciando o Servidor do WhatsApp Bot...');

client.on('qr', async (qr) => {
    console.log('QR Code recebido! Gerando imagem para o Painel Admin...');
    try {
        // Gera o QR Code como um arquivo PNG e salva na pasta public do Next.js
        await qrcode.toFile(qrPath, qr, {
            color: {
                dark: '#000000',  // Pontos pretos
                light: '#ffffff' // Fundo branco
            }
        });
        console.log('Imagem qr.png atualizada no servidor.');
    } catch (err) {
        console.error('Erro ao gerar QR Code image:', err);
    }
});

client.on('ready', () => {
    console.log('Cliente do WhatsApp está pronto!');
    // Quando estiver pronto, exclui a imagem do QR code para o painel não mostrar mais
    if (fs.existsSync(qrPath)) {
        fs.unlinkSync(qrPath);
    }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tempo em que o bot foi iniciado (em segundos)
const botStartTime = Math.floor(Date.now() / 1000);

client.on('message_create', async message => {
    if (message.fromMe) return; // ignora próprias mensagens
    if (message.from.includes('@g.us')) return; // ignora mensagens de grupos

    // IGNORAR MENSAGENS ANTIGAS (enviadas antes do bot ligar ou há mais de 2 minutos)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (message.timestamp < botStartTime || message.timestamp < currentTimestamp - 120) {
        return; // É uma mensagem antiga sendo sincronizada
    }

    const msg = message.body.toLowerCase();
    
    // Resposta automática simples
    if (msg.includes('oi') || msg.includes('ola') || msg.includes('olá') || msg.includes('agendar')) {
        
        // Buscar configuração atualizada no banco de dados
        let botGreeting = "Olá! 💈 Seja muito bem-vindo à *Barbearia Premium*.";
        let shopName = "Barbearia Premium";
        let botActive = true;

        try {
            const settings = await prisma.settings.findUnique({ where: { id: "default_settings" } });
            if (settings) {
                botGreeting = settings.botGreetingMessage || botGreeting;
                shopName = settings.shopName || shopName;
                botActive = settings.botActive;
            }
        } catch (e) {
            console.error("Erro ao buscar config do prisma:", e);
        }

        // Se o bot estiver desligado nas configurações, não responde
        if (!botActive) return;

        const reply = `${botGreeting}
        
Para garantir o melhor atendimento e agendar seu horário sem filas na ${shopName}, acesse nosso portal exclusivo:
👉 *http://localhost:3000/agendar*

Lá você escolhe seu serviço, data e hora em poucos cliques! Te esperamos.`;
        
        await message.reply(reply);
    }
});

client.initialize();
