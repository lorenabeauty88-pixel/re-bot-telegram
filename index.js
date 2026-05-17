const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;

console.log("TOKEN OK:", token ? "SIM" : "NAO");

const bot = new TelegramBot(token, {
  polling: true
});

console.log("🤖 BOT CONECTADO COM POLLING");

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🔥 Bot de achadinhos online!\n\nUse:\n/promo iphone"
  );
});

bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const pesquisa = match[1];

  try {

    bot.sendMessage(chatId, `🔎 Buscando: ${pesquisa}`);

    // EXEMPLO
    bot.sendPhoto(
      chatId,
      "https://http2.mlstatic.com/D_NQ_NP_2X_615792-MLA54964522843_042023-F.webp",
      {
        caption:
          "📱 iPhone em promoção!\n💰 R$ 2.999\n🛒 https://mercadolivre.com"
      }
    );

  } catch (error) {

    console.log(error);

    bot.sendMessage(
      chatId,
      "❌ Erro ao buscar produtos agora."
    );
  }
});

bot.on("polling_error", (err) => {
  console.error("Polling error:", err.message);
});
