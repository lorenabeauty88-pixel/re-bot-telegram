const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// TOKEN do Render
const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado no ambiente");
  process.exit(1);
}

// inicia bot
const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT INICIADO COM SUCESSO");

// ===============================
// DEBUG: ver mensagens chegando
// ===============================
bot.on("message", (msg) => {
  console.log("📩 CHEGOU MENSAGEM:", msg.text);
});

// ===============================
// START
// ===============================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🌸 *Achadinhos Viral Bot*\n\n👉 Use:\n/promo nome do produto",
    { parse_mode: "Markdown" }
  );
});

// ===============================
// PROMO (Mercado Livre)
// ===============================
bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  try {
    bot.sendMessage(chatId, "🔎 Buscando ofertas no Mercado Livre...");

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url);

    const items = response.data.results;

    if (!items || items.length === 0) {
      return bot.sendMessage(chatId, "❌ Nenhum produto encontrado.");
    }

    const top = items.slice(0, 3);

    let message = `🔥 *Achadinhos para:* ${query}\n\n`;

    top.forEach((item) => {
      message +=
        `🛍 *${item.title}*\n` +
        `💰 R$ ${item.price}\n` +
        `🔗 ${item.permalink}\n\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });

  } catch (error) {
    console.log("❌ ERRO:", error.message);
    bot.sendMessage(chatId, "⚠️ Erro ao buscar produtos. Tente novamente.");
  }
});
