const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

/**
 * 🔎 PEGA PRODUTO PELO LINK (MERCADO LIVRE)
 */
async function buscarPorLinkML(link) {
  try {
    const match = link.match(/MLB\d+/);
    if (!match) return null;

    const id = match[0];

    const url = `https://api.mercadolibre.com/items/${id}`;
    const res = await axios.get(url);

    const item = res.data;

    const precoAtual = item.price;
    const precoOriginal = item.original_price || item.price;

    // calcula desconto
    let desconto = 0;
    if (precoOriginal > precoAtual) {
      desconto = Math.round(((precoOriginal - precoAtual) / precoOriginal) * 100);
    }

    return {
      nome: item.title,
      preco: precoAtual,
      precoOriginal: precoOriginal,
      desconto: desconto,
      link: item.permalink,
      imagem: item.thumbnail
    };

  } catch (err) {
    console.log(err.message);
    return null;
  }
}

/**
 * 🚀 START
 */
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🔥 RE RECOMENDA ON\n\n" +
    "Envie um link do Mercado Livre:\n" +
    "/recomenda link"
  );
});

/**
 * 🔥 RE RECOMENDA
 */
bot.onText(/\/recomenda (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1];

  bot.sendMessage(chatId, "🔎 Analisando produto...");

  if (!input.includes("http")) {
    return bot.sendMessage(chatId, "❌ Envie um link do Mercado Livre.");
  }

  const produto = await buscarPorLinkML(input);

  if (!produto) {
    return bot.sendMessage(chatId, "❌ Não consegui ler esse produto.");
  }

  const gif = "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif";

  bot.sendAnimation(chatId, gif);

  bot.sendPhoto(chatId, produto.imagem, {
    caption:
      `🔥 RE RECOMENDA\n\n` +
      `🛍 ${produto.nome}\n\n` +
      `💰 Preço atual: R$ ${produto.preco}\n` +
      (produto.desconto > 0
        ? `🔥 Desconto: ${produto.desconto}% OFF\n`
        : `🔥 Sem promoção ativa\n`) +
      `\n🔗 Comprar agora:\n${produto.link}`
  });
});
