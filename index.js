const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT ACHADINHOS ML ONLINE");

// 🔍 extrai ID corretamente do link
function extrairId(url) {
  const match = url.match(/MLB\d+/i); // pega MLB123 ou MLB-123

  if (!match) return null;

  return match[0].replace("-", "");
}

// 🚀 busca produto real pela API certa
async function getProdutoML(link) {
  const id = extrairId(link);

  if (!id) return null;

  try {
    const res = await axios.get(
      `https://api.mercadolibre.com/items/${id}`
    );

    const p = res.data;

    return {
      nome: p.title,
      preco: p.price,
      imagem: p.pictures?.[0]?.url,
      link: p.permalink
    };

  } catch (err) {
    console.log("Erro API ML:", err.message);
    return null;
  }
}

// 📩 qualquer link enviado
bot.on("message", async (msg) => {
  const text = msg.text;

  if (!text || !text.includes("mercadolivre")) return;

  const p = await getProdutoML(text);

  if (!p) {
    return bot.sendMessage(
      msg.chat.id,
      "❌ Não consegui encontrar esse produto. Envie um link válido do Mercado Livre."
    );
  }

  bot.sendPhoto(msg.chat.id, p.imagem, {
    caption: `🔥 ACHADINHO MERCADO LIVRE 🔥

📦 ${p.nome}

💰 R$ ${p.preco}

🔗 ${p.link}`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🛒 COMPRAR AGORA", url: p.link }]
      ]
    }
  });
});
