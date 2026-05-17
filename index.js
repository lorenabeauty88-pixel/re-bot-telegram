const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

console.log("BOT START");

if (!token) {
  console.log("SEM TOKEN");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  console.log("RECEBI:", msg.text);

  bot.sendMessage(msg.chat.id, "🔥 FUNCIONANDO - RECEBI SUA MENSAGEM");
});
