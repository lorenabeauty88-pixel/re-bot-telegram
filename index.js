const TelegramBot = require("node-telegram-bot-api");

console.log("🔥 BOT INICIADO");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

// captura QUALQUER mensagem
bot.on("message", (msg) => {
  console.log("📩 MENSAGEM CHEGOU:", msg.text);

  bot.sendMessage(msg.chat.id, "🔥 ESTOU RECEBENDO MENSAGENS");
});
