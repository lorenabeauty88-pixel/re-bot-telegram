const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

async function buscarPorLinkML(link) {
  try {
    const match = link.match(/MLB\d+/i);
    if (!match) return null;

    const id = match[0];

    const res = await axios.get(`https://api.mercadolibre.com/items/${id}`);
    const item = res.data;

    const preco = item.price;
    const original = item.original_price || item.price;

    let desconto = 0;
    if (original > preco) {
      desconto = Math.round(((original - preco) / original) * 100);
    }

    return {
      nome: item.title,
      preco,
      desconto,
      link: item.permalink,
      imagem: item.thumbnail
    };

  } catch (err) {
    console.log("ERRO:", err.message);
    return null;
  }
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 BOT ONLINE\nUse /recomenda link");
});

bot.onText(/\/recomenda (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1];

  bot.sendMessage(chatId, "🔎 Processando...");

  if (!input.includes("http")) {
    return bot.sendMessage(chatId, "❌ Envie um link do Mercado Livre.");
  }

  const produto = await buscarPorLinkML(input);

  if (!produto) {
    return bot.sendMessage(chatId, "❌ Não consegui abrir o link.");
  }

  const gif = "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif";

  bot.sendAnimation(chatId, gif);

  bot.sendPhoto(chatId, produto.imagem, {
    caption:
      `🔥 RE RECOMENDA\n\n` +
      `🛍 ${produto.nome}\n` +
      `💰 R$ ${produto.preco}\n` +
      (produto.desconto > 0 ? `🔥 ${produto.desconto}% OFF\n\n` : "\n") +
      `🔗 ${produto.link}`
  });
});
