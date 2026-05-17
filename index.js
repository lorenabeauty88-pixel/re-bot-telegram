const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

console.log("🔥 BOT INICIANDO...");

const bot = new TelegramBot(token, {
  polling: true
});

bot.on("polling_error", (err) => {
  console.log("❌ POLLING ERROR:", err.message);
});

bot.on("message", (msg) => {
  console.log("📩 CHEGOU MENSAGEM:", msg.text);

  bot.sendMessage(msg.chat.id, "🔥 RECEBI SUA MENSAGEM");
});
