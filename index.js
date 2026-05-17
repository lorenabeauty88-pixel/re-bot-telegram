const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

// 🔥 BOT
const bot = new TelegramBot(token, {
  polling: {
    interval: 1000,
    autoStart: true
  }
});

console.log("🔥 BOT INICIADO");

// 🧹 webhook
bot.deleteWebHook()
  .then(() => console.log("🧹 Webhook removido"))
  .catch(() => {});

// 📩 debug mensagens
bot.on("message", (msg) => {
  console.log("📩 CHEGOU MENSAGEM:", msg.text);
});

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 Bot de Achadinhos ativo!");
});

// 🔎 /promo (corrigido e estável)
bot.onText(/\/promo(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1]?.trim();

  if (!query) {
    return bot.sendMessage(chatId, "👉 Use: /promo celular");
  }

  console.log("🔥 PROMO ATIVADO:", query);

  try {
    bot.sendMessage(chatId, "🔎 Buscando achadinhos...");

    // 🔥 LINK ESTÁVEL (menos 403)
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=5`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      },
      timeout: 15000
    });

    const items = res.data.results;

    if (!items || items.length === 0) {
      return bot.sendMessage(chatId, "❌ Nenhum produto encontrado.");
    }

    const top = items
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);

    for (const item of top) {
      const text =
        `🔥 ACHADINHO\n\n` +
        `🛍 ${item.title}\n` +
        `💰 R$ ${item.price}\n` +
        `🔗 ${item.permalink}`;

      if (item.thumbnail) {
        await bot.sendPhoto(chatId, item.thumbnail, { caption: text });
      } else {
        await bot.sendMessage(chatId, text);
      }
    }

  } catch (err) {
    console.log("❌ ERRO:", err.response?.status || err.message);
    bot.sendMessage(chatId, "⚠️ Erro ao buscar produtos. Tente novamente.");
  }
});
