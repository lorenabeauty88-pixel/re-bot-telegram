const TelegramBot = require("node-telegram-bot-api");

console.log("INICIANDO BOT...");

console.log("TOKEN:", process.env.BOT_TOKEN);

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on("polling_error", (err) => {
  console.log("POLLING ERROR:", err);
});

bot.on("message", (msg) => {
  console.log("RECEBI:", msg.text);

  bot.sendMessage(msg.chat.id, "🔥 FUNCIONANDO!");
});
