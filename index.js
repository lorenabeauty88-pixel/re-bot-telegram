const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT ACHADINHOS ML ONLINE");

// 🔍 extrair ID do link
function extrairId(url) {
  const match = url.match(/MLB-\d+/);
  return match ? match[0] : null;
}

// 🚀 FUNÇÃO QUE BUSCA PRODUTO
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

// 📩 QUALQUER MENSAGEM = TRATA COMO LINK
bot.on("message", async (msg) => {
  const text = msg.text;

  if (!text.startsWith("http")) return;

  try {
    const p = await getProdutoML(text);

    if (!p) {
      return bot.sendMessage(msg.chat.id, "❌ Link inválido do Mercado Livre");
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

  } catch (err) {
    console.log(err.message);
    bot.sendMessage(msg.chat.id, "❌ Erro ao buscar produto");
  }
});
