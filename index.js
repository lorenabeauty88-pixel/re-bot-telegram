const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

// 🔍 TESTE DO TOKEN
console.log("🔑 TOKEN CARREGADO:", token ? "SIM" : "NÃO");

// ❌ trava o bot se não tiver token
if (!token) {
  console.log("❌ BOT_TOKEN não encontrado. Configure no painel!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT INICIANDO COM SUCESSO");

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🌸 Bem-vindo ao Achadinhos Viral 🚀

Comandos:
/promo - ver ofertas`
  );
});

// PROMO
bot.onText(/\/promo/, (msg) => {
  const chatId = msg.chat.id;

  const produto = {
    nome: "Fone Bluetooth Bass 🔊",
    preco: "R$ 49,90",
    link: "https://seulinkafiliado.com",
    imagem: "https://i.imgur.com/Exemplo.jpg"
  };

  bot.sendPhoto(chatId, produto.imagem, {
    caption: `🔥 OFERTA ACHADINHO 🔥

📦 ${produto.nome}
💰 ${produto.preco}

👉 Comprar: ${produto.link}`
  });
});

// RESPOSTA PADRÃO
bot.on("message", (msg) => {
  if (!msg.text.startsWith("/")) {
    bot.sendMessage(msg.chat.id, "Digite /promo para ver ofertas 🔥");
  }
});
