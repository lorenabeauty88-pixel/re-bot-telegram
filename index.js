const TelegramBot = require("node-telegram-bot-api");

console.log("🔥 INICIANDO BOT...");

const token = process.env.BOT_TOKEN;

console.log("🔑 TOKEN STATUS:", token ? "OK" : "FALTANDO");

if (!token) {
  console.log("❌ BOT_TOKEN NÃO DEFINIDO NO RAILWAY");
  process.exit(1);
}

let bot;

try {
  bot = new TelegramBot(token, { polling: true });
  console.log("🤖 BOT CRIADO COM SUCESSO");
} catch (e) {
  console.log("❌ ERRO AO CRIAR BOT:", e.message);
  process.exit(1);
}

bot.on("message", (msg) => {
  console.log("📩 MSG RECEBIDA:", msg.text);
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 BOT FUNCIONANDO PERFEITAMENTE");
});

bot.on("polling_error", (err) => {
  console.log("❌ POLLING ERROR:", err.message);
});
