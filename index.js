const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

console.log("TOKEN:", token);

if (!token) {
  console.log("❌ BOT_TOKEN não definido");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT ONLINE");

// 🔥 captura erros globais (EVITA SUMIR)
process.on("uncaughtException", (err) => {
  console.log("ERRO:", err.message);
});

// detecta loja
function detectarLoja(url) {
  if (url.includes("mercadolivre") || url.includes("meli.la")) return "ml";
  return null;
}

// ML simples e seguro
async function pegarML(link) {
  try {
    const res = await axios.get("https://api.mercadolibre.com/sites/MLB/search?q=" + encodeURIComponent(link));

    const item = res.data.results?.[0];
    if (!item) return null;

    return {
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail,
      link: item.permalink
    };

  } catch (e) {
    console.log("ML erro:", e.message);
    return null;
  }
}

bot.on("message", async (msg) => {
  try {
    const text = msg.text;

    if (!text || !text.startsWith("http")) return;

    const loja = detectarLoja(text);

    if (!loja) {
      return bot.sendMessage(msg.chat.id, "❌ Link não suportado");
    }

    const p = await pegarML(text);

    if (!p) {
      return bot.sendMessage(msg.chat.id, "❌ Produto não encontrado");
    }

    bot.sendPhoto(msg.chat.id, p.imagem, {
      caption: `🔥 ACHADINHO

📦 ${p.nome}
💰 R$ ${p.preco}

🔗 ${p.link}`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛒 COMPRAR", url: p.link }]
        ]
      }
    });

  } catch (err) {
    console.log("BOT ERRO:", err.message);
  }
});
