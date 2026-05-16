const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const token = process.env.BOT_TOKEN;
const URL = process.env.URL; // https://seu-app.onrender.com

if (!token || !URL) {
  console.log("❌ Faltando BOT_TOKEN ou URL nas variáveis de ambiente");
  process.exit(1);
}

// 🔥 inicia bot SEM polling (webhook only)
const bot = new TelegramBot(token);

// ================================
// 🌐 EXPRESS SERVER
// ================================
const app = express();
app.use(express.json());

// webhook endpoint
const webhookPath = `/bot${token}`;

app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ================================
// 🧠 DETECTA PLATAFORMA
// ================================
function detectarPlataforma(url) {
  if (url.includes("shopee")) return "SHOPEE";
  if (url.includes("amazon")) return "AMAZON";
  if (url.includes("shein")) return "SHEIN";
  if (url.includes("mercadolivre")) return "MERCADO_LIVRE";
  return "DESCONHECIDO";
}

// ================================
// 💎 COPY SIMPLES E ESTÁVEL
// ================================
function gerarCopy(url, plataforma) {

  let emoji = "🛒";

  if (plataforma === "AMAZON") emoji = "📦";
  if (plataforma === "SHOPEE") emoji = "🛍️";
  if (plataforma === "SHEIN") emoji = "👗";
  if (plataforma === "MERCADO_LIVRE") emoji = "🏷️";

  return `
🚨 ${plataforma} OFERTA

${emoji} Produto detectado automaticamente

🔗 ${url}

🔥 Re Recomenda Ofertas
`;
}

// ================================
// 🤖 COMANDO /promo
// ================================
bot.onText(/\/promo (.+)/, async (msg, match) => {

  const url = match[1];
  const plataforma = detectarPlataforma(url);

  const post = gerarCopy(url, plataforma);

  bot.sendMessage(msg.chat.id, post);
});

// ================================
// 🚀 START SERVER + WEBHOOK
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log("🔥 BOT WEBHOOK ONLINE NA PORTA", PORT);

  const webhookURL = `${URL}${webhookPath}`;

  try {
    await bot.setWebHook(webhookURL);
    console.log("✅ WEBHOOK ATIVADO:", webhookURL);
  } catch (err) {
    console.log("❌ ERRO WEBHOOK:", err.message);
  }
});
