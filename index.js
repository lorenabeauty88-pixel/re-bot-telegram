const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

console.log("BOT INICIANDO...");
console.log("TOKEN RECEBIDO:", token ? "OK" : "FALHANDO");

if (!token) {
  console.log("❌ BOT_TOKEN NÃO CARREGOU");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (err) => {
  console.log("POLLING ERROR:", err.code || err.message);
});

bot.on("message", (msg) => {
  console.log("📩 MENSAGEM RECEBIDA:", msg.text);

  bot.sendMessage(msg.chat.id, "🔥 FUNCIONANDO 100%");
});
