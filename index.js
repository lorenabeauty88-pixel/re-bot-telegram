const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

console.log("🔥 BOT INICIANDO");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  console.log("📩 RECEBIDO:", text);

  if (!text.startsWith("/recomenda")) return;

  const link = text.replace("/recomenda", "").trim();

  if (!link) {
    return bot.sendMessage(chatId, "❌ Envie um link depois do comando.");
  }

  bot.sendMessage(chatId, "🔎 Buscando produto...");

  try {
    const match = link.match(/MLB\d+/i);

    if (!match) {
      return bot.sendMessage(chatId, "❌ Link inválido do Mercado Livre.");
    }

    const id = match[0];

    const res = await axios.get(`https://api.mercadolibre.com/items/${id}`);
    const item = res.data;

    const preco = item.price;
    const original = item.original_price || item.price;

    let desconto = 0;
    if (original > preco) {
      desconto = Math.round(((original - preco) / original) * 100);
    }

    const gif = "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif";

    await bot.sendAnimation(chatId, gif);

    await bot.sendPhoto(chatId, item.thumbnail, {
      caption:
        `🔥 RE RECOMENDA\n\n` +
        `🛍 ${item.title}\n` +
        `💰 R$ ${preco}\n` +
        (desconto > 0 ? `🔥 ${desconto}% OFF\n\n` : "\n") +
        `🔗 ${item.permalink}`
    });

  } catch (err) {
    console.log("ERRO:", err.message);
    bot.sendMessage(chatId, "❌ Erro ao buscar produto.");
  }
});
