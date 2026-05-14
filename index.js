const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Bot funcionando!');
});

// INSTAGRAM
const insta = "https://instagram.com/SEU_USUARIO";

bot.onText(/\/insta/, (msg) => {
  bot.sendMessage(msg.chat.id, insta);
});

// PROMO (envia mensagem que você digitar)
bot.onText(/\/promo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const texto = match[1];

  bot.sendMessage(chatId, texto);
});

console.log("Bot iniciado");
