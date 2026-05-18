const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN não configurado!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🤖 BOT CONECTADO COM POLLING");

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "👋 Olá! Sou o Achadinhos Bot!\n\nUse /promo <produto>\n\nExemplo:\n/promo iphone"
  );
});

bot.onText(/\/promo (.+)/, async (msg, match) => {

  const chatId = msg.chat.id;
  const query = match[1];

  try {

    await bot.sendMessage(chatId, `🔎 Buscando: ${query}`);

    const url =
      `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=5`;

    You reached the start of the range
May 18, 2026, 8:37 AM
🤖 BOT CONECTADO COM POLLING
> node index.js

    const produtos = response.data.results;

    if (!produtos || produtos.length === 0) {

      return bot.sendMessage(
        chatId,
        "❌ Nenhum produto encontrado."
      );
    }

    for (const item of produtos.slice(0, 5)) {

      const mensagem =
        `🔥 ACHADINHO\n\n` +
        `🛍 ${item.title}\n` +
        `💰 R$ ${item.price}\n` +
        `🔗 ${item.permalink}`;

      const image = item.thumbnail?.replace("I.jpg", "O.jpg");

      try {

        await bot.sendPhoto(chatId, image, {
          caption: mensagem
        });

      } catch {

        await bot.sendMessage(
          chatId,
          mensagem
        );
      }
    }

  } catch (error) {

    console.log(
  "❌ ERRO:",
  error.response?.data || error.message
);
    bot.sendMessage(
      chatId,
      "❌ Erro ao buscar produtos agora."
    );
  }
});

bot.on("polling_error", (err) => {
  console.error("Polling error:", err.message);
});
