const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT ACHADINHOS ONLINE");

// 🔥 resolve link (meli.la ou qualquer redirect)
async function resolverLink(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 10,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    return res.request.res.responseUrl || url;
  } catch (e) {
    return url;
  }
}

// 🔍 detecta Mercado Livre
function isMercadoLivre(url) {
  return url.includes("mercadolivre") || url.includes("meli.la");
}

// 🚀 busca produto real
async function pegarProdutoML(link) {
  try {
    const realLink = await resolverLink(link);

    const res = await axios.get(
      `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(realLink)}`
    );

    const item = res.data.results?.[0];

    if (!item) return null;

    return {
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail,
      link: item.permalink
    };

  } catch (err) {
    console.log("Erro ML:", err.message);
    return null;
  }
}

// 📩 mensagem do usuário
bot.on("message", async (msg) => {
  try {
    const text = msg.text;

    if (!text || !text.startsWith("http")) return;

    if (!isMercadoLivre(text)) {
      return bot.sendMessage(msg.chat.id, "❌ Só aceito links do Mercado Livre por enquanto");
    }

    const p = await pegarProdutoML(text);

    if (!p) {
      return bot.sendMessage(msg.chat.id, "❌ Não consegui encontrar o produto");
    }

    bot.sendPhoto(msg.chat.id, p.imagem, {
      caption: `🔥 ACHADINHO DO DIA 🔥

📦 ${p.nome}

💰 DE: ~~R$ ${(p.preco * 1.6).toFixed(2)}~~
🔥 POR: R$ ${p.preco.toFixed(2)}

📉 DESCONTO IMPERDÍVEL

⚡ Clique no botão abaixo`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛒 COMPRAR AGORA", url: p.link }]
        ]
      }
    });

  } catch (err) {
    console.log("BOT ERROR:", err.message);
  }
});
