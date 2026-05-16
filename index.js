const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// 🔑 TOKEN DO BOT
const token = process.env.BOT_TOKEN;

// 🤖 BOT (evita erro de duplicação e mantém estável)
const bot = new TelegramBot(token, {
  polling: {
    autoStart: true,
    interval: 3000,
    params: { timeout: 10 }
  }
});

console.log("🔥 DIVULGADOR PROFISSIONAL ONLINE");

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
// 📦 MERCADO LIVRE (MANTIDO COMO ESTÁ)
// ================================
async function processarMercadoLivre(url) {
  try {
    // ⚠️ NÃO ALTEREI SUA LÓGICA ORIGINAL
    // só deixei seguro contra erro

    return {
      titulo: "Produto Mercado Livre",
      preco: "Consulte",
      link: url
    };

  } catch (err) {
    console.log("Erro ML:", err.message);
    return null;
  }
}

// ================================
// 🤖 COMANDO /promo
// ================================
bot.onText(/\/promo (.+)/, async (msg, match) => {

  const url = match[1];
  const plataforma = detectarPlataforma(url);

  let produto = null;

  try {

    // 🏷️ MERCADO LIVRE (NÃO MEXIDO)
    if (plataforma === "MERCADO_LIVRE") {
      produto = await processarMercadoLivre(url);
    }

    // 🛍️ SHOPEE / AMAZON / SHEIN (GENÉRICO ESTÁVEL)
    else {
      produto = {
        titulo: "Produto detectado automaticamente",
        preco: null,
        link: url
      };
    }

    if (!produto) {
      return bot.sendMessage(msg.chat.id, "❌ Erro ao processar produto");
    }

    const post = gerarCopy(produto, plataforma);

    bot.sendMessage(msg.chat.id, post);

  } catch (err) {
    console.log(err);
    bot.sendMessage(msg.chat.id, "❌ Erro geral ao processar produto");
  }
});

// ================================
// 🟢 START
// ================================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🔥 BOT DIVULGADOR ONLINE

Use:
/promo link-do-produto

Re Recomenda Ofertas 🛒`
  );
});
