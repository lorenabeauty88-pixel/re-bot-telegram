const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

console.log("🔥 BOT INICIANDO...");

// 🔥 FORÇA POLLING LIMPO
const bot = new TelegramBot(token, {
  polling: {
    interval: 1000,
    autoStart: true
  }
});

// ============================
// 🧪 TESTE DE CONEXÃO
// ============================
bot.on("polling_error", (error) => {
  console.log("❌ POLLING ERROR:", error.message);
});

// ============================
// 🤖 START
// ============================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🔥 BOT ONLINE

✔ Funcionando corretamente
✔ Conectado ao Telegram
`);
});

// ============================
// 💰 PROMO
// ============================
bot.onText(/\/promo (.+)/, (msg, match) => {
  const url = match[1];

  bot.sendMessage(msg.chat.id,
`🚨 OFERTA DETECTADA

🔗 ${url}

🔥 Re Recomenda Ofertas`);
});

// ============================
// 👀 DEBUG (IMPORTANTE)
// ============================
bot.on("message", (msg) => {
  console.log("📩 Mensagem recebida:", msg.text);
});
