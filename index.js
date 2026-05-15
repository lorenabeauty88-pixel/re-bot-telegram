const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

/**
 * BASE DE PRODUTOS (você pode aumentar depois)
 */
const produtos = [
  {
    nome: "Fone Bluetooth Top Bass",
    preco: "R$ 39,90",
    desconto: "70% OFF",
    link: "https://seulinkdeafiliado.com/1",
    imagem: "https://via.placeholder.com/300"
  },
  {
    nome: "Mini Caixa de Som Bluetooth",
    preco: "R$ 29,90",
    desconto: "60% OFF",
    link: "https://seulinkdeafiliado.com/2",
    imagem: "https://via.placeholder.com/300"
  },
  {
    nome: "Luminária LED Criativa",
    preco: "R$ 24,90",
    desconto: "50% OFF",
    link: "https://seulinkdeafiliado.com/3",
    imagem: "https://via.placeholder.com/300"
  }
];

/**
 * START
 */
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🌸 Achadinhos Viral 🚀\n\n" +
    "Use:\n" +
    "/promo nome do produto\n" +
    "/recomenda (ou /rerecomenda) 🔥"
  );
});

/**
 * PROMO por busca
 */
bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  bot.sendMessage(chatId, "🔎 Buscando promoções...");

  try {
    const produto = {
      nome: `🔥 Oferta encontrada: ${query}`,
      preco: "R$ 49,90",
      desconto: "50% OFF",
      link: "https://seulinkdeafiliado.com",
      imagem: "https://via.placeholder.com/300"
    };

    bot.sendPhoto(chatId, produto.imagem, {
      caption:
        `🛍 ${produto.nome}\n\n` +
        `💰 Preço: ${produto.preco}\n` +
        `🏷 Desconto: ${produto.desconto}\n\n` +
        `🔗 Comprar: ${produto.link}`
    });

  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, "❌ Erro ao buscar promoção.");
  }
});

/**
 * 🔥 RECOMENDA (achadinhos aleatórios)
 */
bot.onText(/\/(recomenda|rerecomenda)/, (msg) => {
  const chatId = msg.chat.id;

  const produto = produtos[Math.floor(Math.random() * produtos.length)];

  bot.sendPhoto(chatId, produto.imagem, {
    caption:
      `🔥 RECOMENDAÇÃO ESPECIAL\n\n` +
      `🛍 ${produto.nome}\n` +
      `💰 ${produto.preco}\n` +
      `🏷 ${produto.desconto}\n\n` +
      `🔗 Comprar agora: ${produto.link}`
  });
});

/**
 * ERRO COMANDO
 */
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text.startsWith("/start") && !text.startsWith("/promo") && !text.startsWith("/recomenda")) {
    bot.sendMessage(
      chatId,
      "❗ Comando não reconhecido.\nUse:\n/promo ou /recomenda"
    );
  }
});
