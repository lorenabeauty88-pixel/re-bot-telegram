const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

/**
 * 🔎 PEGA PRODUTO PELO LINK (MERCADO LIVRE)
 */
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
    console.log(err.message);
    return null;
  }
}

/**
 * 🔥
