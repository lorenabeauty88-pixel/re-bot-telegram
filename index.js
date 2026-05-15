const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true,
});

const canal = "@SEUCANAL";

console.log("Bot online");

bot.onText(/\/promo/, async (msg) => {

  bot.sendPhoto(
    canal,
    "https://images.unsplash.com/photo-1541643600914-78b084683601",
    {
      caption:
`🔥 PROMO IMPERDÍVEL 🔥

🛍 Kit Carolina Herrera Good Girl

💸 De: R$ 766,85
🔥 Por: R$ 582,78

💳 10x sem juros

✅ Produto original
✅ Frete rápido
✅ Oferta limitada

🔗 COMPRE AQUI:
https://seulink.com`,
    }
  );

});