const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 BOT ONLINE!");

const promoList = [
  {
    nome: "Fone Bluetooth Pro",
    preco: "R$ 39,90",
    link: "https://seulink.com"
  },
  {
    nome: "Relógio Smartwatch",
    preco: "R$ 79,90",
    link: "https://seulink.com"
  },
  {
    nome: "Mini Caixa de Som",
    preco: "R$ 29,90",
    link: "https://seulink.com"
  }
];

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🌸 Bem-vindo ao Bot de Achadinhos!\n\n🔥 Use /promo para ver ofertas"
  );
});

bot.onText(/\/promo/, (msg) => {
  let text = "🔥 *PROMOÇÕES DO DIA*\n\n";

  promoList.forEach((item) => {
    text +=
      `🛍️ *${item.nome}*\n` +
      `💰 ${item.preco}\n` +
      `👉 ${item.link}\n\n`;
  });

  bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
});
