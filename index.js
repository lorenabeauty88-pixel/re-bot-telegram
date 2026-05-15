const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true
});

console.log("✅ Bot online...");

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(
    msg.chat.id,

`🌸 BOT DE OFERTAS 🌸

Envie:

/promo link

Exemplo:
/promo https://google.com`
  );

});

bot.onText(/\/promo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const link = match[1];

  const foto =
    "https://i.imgur.com/2s9XK4p.jpeg";

  bot.sendPhoto(chatId, foto, {

    caption:
`🔥 SUPER OFERTA 🔥

🛍️ Produto em promoção
🚚 Frete disponível
⏰ Oferta limitada

👇 Clique no botão abaixo 👇`,

    reply_markup: {

      inline_keyboard: [
        [
          {
            text: "🛒 VER OFERTA",
            url: link
          }
        ]
      ]

    }

  });

});

bot.on("polling_error", (error) => {
  console.log(error.message);
});
