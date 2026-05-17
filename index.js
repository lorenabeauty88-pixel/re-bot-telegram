const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// TOKEN do bot (Render / env)
const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado nas variáveis de ambiente");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT INICIADO COM SUCESSO");

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🌸 Bem-vindo ao Achadinhos Viral!\n\n👉 Use:\n/promo nome do produto"
  );
});

// /promo
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

    // pega os 3 primeiros resultados
    const top = items.slice(0, 3);

    let message = `🔥 *Achadinhos para:* ${query}\n\n`;

    top.forEach((item, index) => {
      message +=
        `🛍 *${item.title}*\n` +
        `💰 R$ ${item.price}\n` +
        `🔗 ${item.permalink}\n\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });

  } catch (error) {
    console.log("Erro:", error.message);
    bot.sendMessage(chatId, "⚠️ Erro ao buscar produtos. Tente novamente.");
  }
});
bot.on("message", (msg) => {
  console.log("📩 RECEBI:", msg.text);
});
