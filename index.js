const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true
});

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(
    msg.chat.id,
`🌸 BOT DE PROMOÇÕES ONLINE 🚀

Use:

/promo LINK`
  );

});

bot.onText(/\/promo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;

  const link = match[1];

  const texto = `
🛍️ *PROMOÇÃO DO DIA* 🔥

💸 Oferta imperdível

🔗 *Compre aqui:*
${link}

❤️ *GRUPOS COM VAGAS*
https://seulink.com
`;

  bot.sendMessage(chatId, texto, {
    parse_mode: "Markdown",
    disable_web_page_preview: false
  });

});

console.log("Bot online 🚀");
