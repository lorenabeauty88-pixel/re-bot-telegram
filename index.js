const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

console.log("🤖 BOT MERCADO LIVRE ONLINE!");

/**
 * FUNÇÃO: buscar produtos no Mercado Livre
 */
async function buscarProduto(query) {
  try {
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`;

    const res = await axios.get(url);

    return res.data.results.slice(0, 3); // pega 3 primeiros
  } catch (err) {
    console.log("Erro API Mercado Livre:", err.message);
    return [];
  }
}

/**
 * COMANDO: /produto celular
 */
bot.onText(/\/produto (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  bot.sendMessage(chatId, `🔎 Buscando: *${query}*...`, { parse_mode: "Markdown" });

  const produtos = await buscarProduto(query);

  if (!produtos.length) {
    return bot.sendMessage(chatId, "❌ Não encontrei produtos agora.");
  }

  for (const item of produtos) {
    const texto =
      `🔥 *OFERTA ACHADA*\n\n` +
      `🛍️ ${item.title}\n` +
      `💰 *R$ ${item.price}*\n` +
      `👉 [Comprar agora](${item.permalink})`;

    if (item.thumbnail) {
      bot.sendPhoto(chatId, item.thumbnail, {
        caption: texto,
        parse_mode: "Markdown"
      });
    } else {
      bot.sendMessage(chatId, texto, { parse_mode: "Markdown" });
    }
  }
});

/**
 * START
 */
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🤖 *Bot de Achadinhos Mercado Livre*\n\nUse:\n/produto celular\n/produto fone\n/produto notebook",
    { parse_mode: "Markdown" }
  );
});
