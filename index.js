const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT ACHADINHOS ML ONLINE");

// 🔍 EXTRAI ID DO MERCADO LIVRE (CORRIGIDO)
function extrairId(url) {
  const match = url.match(/MLB-?\d+/);

  if (!match) return null;

  return match[0].replace("-", "");
}

// 🚀 BUSCA PRODUTO NO MERCADO LIVRE
async function getProdutoML(link) {
  const id = extrairId(link);

  if (!id) {
    return null;
  }

  const url = `https://api.mercadolibre.com/items/${id}`;
  const res = await axios.get(url);

  const p = res.data;

  return {
    nome: p.title,
    preco: p.price,
    imagem: p.pictures?.[0]?.url,
    link: p.permalink
  };
}

// 📩 QUALQUER LINK = ACHADINHO AUTOMÁTICO
bot.on("message", async (msg) => {
  const text = msg.text;

  if (!text || !text.startsWith("http")) return;

  try {
    const p = await getProdutoML(text);

    if (!p) {
      return bot.sendMessage(
        msg.chat.id,
        "❌ Link inválido do Mercado Livre"
      );
    }

    bot.sendPhoto(msg.chat.id, p.imagem, {
      caption: `🔥 ACHADINHO MERCADO LIVRE 🔥

📦 ${p.nome}

💰 R$ ${p.preco}

🔗 ${p.link}

⚡ Oferta atualizada automaticamente`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛒 COMPRAR AGORA", url: p.link }]
        ]
      }
    });

  } catch (err) {
    console.log("Erro:", err.message);
    bot.sendMessage(msg.chat.id, "❌ Erro ao buscar produto");
  }
});
