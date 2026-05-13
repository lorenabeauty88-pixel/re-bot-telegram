const TelegramBot = require('node-telegram-bot-api');

// Token vindo do Render (Environment Variables)
const token = process.env.8937736096:AAFXTJJaoZX98h4sz-r0BF-v-2p2ITWYkoc;

const bot = new TelegramBot(token, { polling: true });

// Responde qualquer mensagem
bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, 'Bot funcionando 👍');
});
