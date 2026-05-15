const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// TOKEN do Render (Environment Variable)
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

/**
 * 🔥 MERCADO LIVRE (REAL)
 */
async function buscarMercadoLivre(query) {
  try {
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url);

    const item = res.data.results?.[0];
    if (!item) return null;

    return {
      nome: item.title,
      preco: `R$ ${item.price}`,
      link: item.permalink,
      imagem: item.thumbnail,
      loja: "Mercado Livre"
    };
  } catch (err) {
    console.log("Erro ML:", err.message);
    return null;
  }
}

/**
 * 🟠 SHOPEE (AFILIADO MANUAL)
 */
function buscarShopee(query) {
  return {
    nome: "🔥 Oferta Shopee: " + query,
    preco: "ver no app",
    link: "https://shopee.com.br",
    imagem: "https://via.placeholder.com/300",
    loja: "Shopee"
  };
}

/**
 * 🔎 BUSCA GERAL (ML primeiro, depois Shopee)
 */
async function buscarProduto(query) {
  const ml = await buscarMercadoLivre(query);

  if (ml) return ml;

  return buscarShopee(query);
}

/**
 * 🚀 START
 */
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🔥 ACHADINHOS VIRAL ON 🚀\n\n" +
    "/promo produto\n\n" +
    "Exemplo:\n" +
    "/promo fone bluetooth"
  );
});

/**
 * 🔎 PROMO
 */
bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  bot.sendMessage(chatId, "🔎 Buscando as melhores ofertas...");

  try {
    const produto = await buscarProduto(query);

    bot.sendPhoto(chatId, produto.imagem, {
      caption:
        `🔥 ACHADINHO VIRAL\n\n` +
        `🛍 ${produto.nome}\n` +
        `💰 ${produto.preco}\n` +
        `🏬 ${produto.loja}\n\n` +
        `🔗 Comprar agora:\n${produto.link}`
    });

  } catch (err) {
    console.log(err);
    bot.sendMessage(chatId, "❌ Erro ao buscar produto.");
  }
});

/**
 * ❗ COMANDO INVÁLIDO
 */
bot.on("message", (msg) => {
  const text = msg.text;

  if (!text.startsWith("/start") && !text.startsWith("/promo")) {
    bot.sendMessage(
      msg.chat.id,
      "❗ Use:\n/promo nome do produto"
    );
  }
});
