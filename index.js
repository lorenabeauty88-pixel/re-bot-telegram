const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

// CRIA O BOT (ESSA PARTE É OBRIGATÓRIA)
const bot = new TelegramBot(token, {
  polling: {
    interval: 1000,
    autoStart: true
  }
});

console.log("🔥 BOT INICIADO");

// remove webhook antigo
bot.deleteWebHook().then(() => {
  console.log("🧹 Webhook removido");
});

// debug mensagens
bot.on("message", (msg) => {
  console.log("📩 CHEGOU MENSAGEM:", msg.text);
});

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 Bot de Achadinhos ativo!");
});

// /promo (Mercado Livre)
bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  try {
    bot.sendMessage(chatId, "🔎 Buscando achadinhos...");

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url);

    const items = res.data.results;

    if (!items || items.length === 0) {
      return bot.sendMessage(chatId, "❌ Nenhum produto encontrado.");
    }

    const top = items.slice(0, 5);

    for (const item of top) {
      const title = item.title;
      const price = item.price;
      const link = item.permalink;
      const image = item.thumbnail;

      let text =
        `🔥 ACHADINHO\n\n` +
        `🛍 ${title}\n` +
        `💰 R$ ${price}\n` +
        `🔗 ${link}`;

      if (image) {
        await bot.sendPhoto(chatId, image, { caption: text });
      } else {
        await bot.sendMessage(chatId, text);
      }
    }

  } catch (err) {
    console.log(err.message);
    bot.sendMessage(chatId, "⚠️ Erro ao buscar produtos");
  }
});
