const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const URL = process.env.URL;

console.log("🔥 BOT INICIANDO...");

// ==============================
// 🧠 CHECAGEM INTELIGENTE
// ==============================
if (!token) {
  console.log("❌ BOT_TOKEN NÃO FOI ENCONTRADO");
  process.exit(1);
}

// ==============================
// 🤖 BOT (SAFE MODE)
// ==============================
const bot = new TelegramBot(token, {
  polling: true
});

// ==============================
// 🧪 TESTE SIMPLES
// ==============================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🔥 BOT ONLINE

✔ Funcionando corretamente
✔ Token OK
${URL ? "✔ URL OK" : "⚠ URL não configurada (webhook ignorado)"}
`);
});

// ==============================
// 🛍️ PROMO SIMPLES (SEM QUEBRAR)
// ==============================
bot.onText(/\/promo (.+)/, (msg, match) => {
  const url = match[1];

  bot.sendMessage(msg.chat.id,
`🚨 OFERTA DETECTADA

🔗 ${url}

🔥 Re Recomenda Ofertas`
  );
});
