const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

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
  console.log("📩 MENSAGEM:", msg.text);
});

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 Bot de Achadinhos ativo!");
});

// 🔥 função segura (anti 403)
async function fetchML(url) {
  try {
    return await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json"
      },
      timeout: 15000
    });
  } catch (err) {
    console.log("❌ ERRO API:", err.response?.status || err.message);
    throw err;
  }
}

// /promo
bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  try {
    bot.sendMessage(chatId, "🔎 Buscando achadinhos baratos...");

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`;
    const res = await fetchML(url);

    const items = res.data.results;

    if (!items || items.length === 0) {
      return bot.sendMessage(chatId, "❌ Nenhum produto encontrado.");
    }

    const top = items.slice(0, 5);

    for (const item of top) {
      const title = item.title || "Sem título";
      const price = item.price ? `R$ ${item.price}` : "Preço não disponível";
      const link = item.permalink || "";
      const image = item.thumbnail || "";

      let text =
        `🔥 ACHADINHO\n\n` +
        `🛍 ${title}\n` +
        `💰 ${price}\n` +
        `🔗 ${link}`;

      if (image) {
        await bot.sendPhoto(chatId, image, { caption: text });
      } else {
        await bot.sendMessage(chatId, text);
      }
    }

  } catch (err) {
    console.log("❌ FALHA GERAL:", err.message);
    bot.sendMessage(chatId, "⚠️ Erro ao buscar produtos. Tente novamente.");
  }
});
