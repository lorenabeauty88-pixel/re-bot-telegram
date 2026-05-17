const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

// 🔥 cria o bot
const bot = new TelegramBot(token, {
  polling: {
    interval: 1000,
    autoStart: true
  }
});

console.log("🔥 BOT INICIADO");

// 🧹 remove webhook antigo
bot.deleteWebHook()
  .then(() => console.log("🧹 Webhook removido"))
  .catch(() => console.log("⚠️ sem webhook para remover"));

// 📩 log de mensagens
bot.on("message", (msg) => {
  console.log("📩 CHEGOU MENSAGEM:", msg.text);
});

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 Bot de Achadinhos ativo!");
});

// 🔎 /promo (aceita com ou sem texto)
bot.onText(/\/promo(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;

  let query = match[1]?.trim();

  if (!query) {
    return bot.sendMessage(chatId, "👉 Use assim: /promo celular");
  }

  console.log("🔥 PROMO ATIVADO:", query);

  try {
    bot.sendMessage(chatId, "🔎 Buscando achadinhos...");

  const url = `https://api.mercadolibre.com/sites/MLB/search?site_id=MLB&q=${encodeURIComponent(query)}&limit=10`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      timeout: 15000
    });

    const items = res.data.results;

    if (!items || items.length === 0) {
  console.log("❌ API retornou vazio:", query);
  return bot.sendMessage(chatId, "⚠️ Nenhum resultado encontrado. Tente outro termo (ex: fone, iphone, notebook)");
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
