const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

// 🌐 URL do seu servidor (Render / Railway / VPS)
const URL = process.env.URL; // ex: https://seuapp.onrender.com

const bot = new TelegramBot(token);

// 🔥 Webhook ativo
bot.setWebHook(`${URL}/bot${token}`);

const app = express();
app.use(bodyParser.json());

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
// 💎 COPY VIRAL
// ================================
function gerarCopy(p, plataforma) {

  let emoji = "🛒";

  if (plataforma === "AMAZON") emoji = "📦";
  if (plataforma === "SHOPEE") emoji = "🛍️";
  if (plataforma === "SHEIN") emoji = "👗";
  if (plataforma === "MERCADO_LIVRE") emoji = "🏷️";

  return `
🚨 ${plataforma} OFERTA QUENTE 🚨

${emoji} ${p.titulo}

💰 Preço: R$ ${p.preco || "ver no link"}

⚡ Oferta por tempo limitado

🔥 Re Recomenda Ofertas

👇 Clique aqui:
${p.link}
`;
}

// ================================
// 📦 MERCADO LIVRE (MANTIDO)
// ================================
async function processarMercadoLivre(url) {
  return {
    titulo: "Produto Mercado Livre",
    preco: "Consulte",
    link: url
  };
}

// ================================
// 📩 RECEBE UPDATES DO TELEGRAM
// ================================
app.post(`/bot${token}`, async (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ================================
// 🤖 COMANDO /promo
// ================================
bot.onText(/\/promo (.+)/, async (msg, match) => {

  const url = match[1];
  const plataforma = detectarPlataforma(url);

  let produto = null;

  if (plataforma === "MERCADO_LIVRE") {
    produto = await processarMercadoLivre(url);
  } else {
    produto = {
      titulo: "Produto detectado automaticamente",
      preco: null,
      link: url
    };
  }

  const post = gerarCopy(produto, plataforma);

  bot.sendMessage(msg.chat.id, post);
});

// ================================
// 🚀 START SERVER
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 BOT WEBHOOK ONLINE NA PORTA", PORT);
});
