const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado!");
  process.exit(1);
}

console.log("🤖 BOT INICIANDO...");

const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (error) => {
  console.log("Erro polling:", error);
});

bot.on("message", (msg) => {
  console.log("Recebi:", msg.text);

  bot.sendMessage(
    msg.chat.id,
    "🔥 Bot funcionando 100%!\n\nUse /promo"
  );
});

bot.onText(/\/promo/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🛍️ Produto teste\n💰 R$ 29,90\n👉 https://seulink.com"
  );
});
