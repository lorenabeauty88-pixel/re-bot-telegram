const TelegramBot = require('node-telegram-bot-api');

// Token vindo do Render (Environment Variables)
const token = process.env.TOKEN;

const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(token, { polling: true });

// Responde qualquer mensagem
bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, 'Bot funcionando 👍');
});
