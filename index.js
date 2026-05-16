const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cheerio = require("cheerio");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

const bot = new TelegramBot(token, {
  polling: true
});

console.log("🔥 DIVULGADOR INTELIGENTE ONLINE");

// 🚀 resolve link encurtado
async function resolverLink(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 10,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    return response.request.res.responseUrl || url;

  } catch (err) {
    console.log("Erro redirect:", err.message);
    return url;
  }
}

// 🚀 pega produto automaticamente
async function pegarProduto(link) {
  try {

    const realLink = await resolverLink(link);

    const response = await axios.get(realLink, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = response.data;

    const $ = cheerio.load(html);

    // 🔥 título
    let titulo =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      "🔥 Oferta Imperdível";

    // 🔥 imagem
    let imagem =
      $('meta[property="og:image"]').attr("content");

    // 🔥 preço
    let preco =
      $('meta[property="product:price:amount"]').attr("content");

    // fallback preço
    if (!preco) {
      const texto = html.match(/"price":\s?([0-9.]+)/);

      if (texto) {
        preco = texto[1];
      }
    }

    return {
      titulo,
      preco: preco || "Promoção",
      imagem,
      link: realLink
    };

  } catch (err) {
    console.log("Erro produto:", err.message);
    return null;
  }
}

// 🚀 recebe mensagem
bot.on("message", async (msg) => {

  try {

    const text = msg.text;

    if (!text) return;

    // aceita apenas links
    if (!text.startsWith("http")) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Envie um link do produto"
      );
    }

    // mensagem carregando
    const loading = await bot.sendMessage(
      msg.chat.id,
      "🔎 Procurando produto..."
    );

    // pega produto
    const p = await pegarProduto(text);

    if (!p) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Não consegui ler esse produto"
      );
    }

    // preço antigo fake
    let precoAtual = parseFloat(p.preco);

    if (isNaN(precoAtual)) {
      precoAtual = 49.90;
    }

    const precoAntigo =
      (precoAtual * 1.6).toFixed(2);

    // remove loading
    await bot.deleteMessage(
      msg.chat.id,
      loading.message_id
    );

    // envia produto
    if (p.imagem) {

      await bot.sendPhoto(msg.chat.id, p.imagem, {

        caption: `🔥 ACHADINHO DO DIA 🔥

📦 ${p.titulo}

💰 DE: ~~R$ ${precoAntigo}~~
🔥 POR: R$ ${precoAtual.toFixed(2)}

📉 DESCONTO IMPERDÍVEL

⚡ Clique no botão abaixo`,

        parse_mode: "Markdown",

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🛒 COMPRAR AGORA",
                url: p.link
              }
            ]
          ]
        }

      });

    } else {

      // fallback sem imagem
      await bot.sendMessage(msg.chat.id,

        `🔥 ACHADINHO DO DIA 🔥

📦 ${p.titulo}

💰 R$ ${precoAtual.toFixed(2)}

🔗 ${p.link}`

      );
    }

  } catch (err) {

    console.log("BOT ERROR:", err.message);

    bot.sendMessage(
      msg.chat.id,
      "❌ Erro ao processar produto"
    );
  }

});
