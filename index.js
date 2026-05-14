const TelegramBot = require('node-telegram-bot-api');

// pega o token do Railway (Variables)
const token = process.env.TOKEN;

// cria o bot
const bot = new TelegramBot(token, { polling: true });

// comando /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Bot funcionando!');
});

// mensagem simples de teste
bot.on('message', (msg) => {
  if (msg.text && msg.text !== '/start') {
    bot.sendMessage(msg.chat.id, 'Recebi sua mensagem 👍');
  }
});

console.log('Bot iniciado com sucesso');
