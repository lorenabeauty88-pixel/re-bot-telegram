const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

console.log("TOKEN:", token);

const bot = new TelegramBot(token, {
  polling: true
});

console.log("BOT INICIADO");

bot.on("message", (msg) => {
  console.log("Mensagem recebida");

  bot.sendMessage(msg.chat.id, "🔥 BOT FUNCIONANDO!");
});
