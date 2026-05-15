const TelegramBot = require("node-telegram-bot-api");

console.log("🔥 BOT INICIANDO...");
console.log("TOKEN:", process.env.BOT_TOKEN);

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on("message", (msg) => {
  console.log("📩 RECEBEU MENSAGEM");
  bot.sendMessage(msg.chat.id, "🔥 BOT ONLINE FUNCIONANDO");
});
