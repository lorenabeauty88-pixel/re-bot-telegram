const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN NÃO ENCONTRADO");
  process.exit(1);
}

console.log("🔥 BOT INICIANDO...");

// 🔥 FORÇA POLLING SIMPLES E ESTÁVEL
const bot = new TelegramBot(token, {
  polling: true
});

// ============================
// 📡 DEBUG REAL
// ============================
bot.on("message", (msg) => {
  console.log("📩 RECEBIDO:", msg.text);
});

// ============================
// 🤖 START
// ============================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 BOT ONLINE E FUNCIONANDO");
});

// ============================
// 💰 PROMO
// ============================
bot.onText(/\/promo (.+)/, (msg, match) => {
  const url = match[1];

  bot.sendMessage(msg.chat.id,
`🚨 OFERTA

🔗 ${url}

🔥 Re Recomenda Ofertas`);
});

// ============================
// ❌ ERROS DO POLLING
// ============================
bot.on("polling_error", (err) => {
  console.log("❌ POLLING ERROR:", err.message);
});
