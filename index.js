const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT ACHADINHOS ML ONLINE");

// 🔥 PEGA PRODUTO PELO LINK USANDO BUSCA (CORRETO)
async function getProdutoML(link) {
  try {
    const res = await axios.get(
      `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(link)}`
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
    console.log("API erro:", err.message);
    return null;
  }
}

// 📩 QUALQUER LINK
bot.on("message", async (msg) => {
  const text = msg.text;

  if (!text || !text.startsWith("http")) return;

  const p = await getProdutoML(text);

  if (!p) {
    return bot.sendMessage(msg.chat.id, "❌ Não consegui achar esse produto");
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
