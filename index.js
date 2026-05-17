const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

console.log("🤖 BOT ONLINE!");

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🌸 Bem-vindo ao Achadinhos Bot!\n\nUse /promo para ver as ofertas 🔥"
  );
});

bot.onText(/\/promo/, (msg) => {
  const texto =
    "🔥 *PROMOÇÕES DO DIA*\n\n" +
    "🛍️ Fone Bluetooth\n💰 R$ 39,90\n👉 https://seulink.com\n\n" +
    "🛍️ Smartwatch\n💰 R$ 79,90\n👉 https://seulink.com\n\n" +
    "🛍️ Mini Caixa de Som\n💰 R$ 29,90\n👉 https://seulink.com\n";

  bot.sendMessage(msg.chat.id, texto, {
    parse_mode: "Markdown"
  });
});
