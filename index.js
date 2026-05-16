const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cheerio = require("cheerio");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

// 🚀 BOT
const bot = new TelegramBot(token);

// 🔥 remove webhook antigo
bot.deleteWebHook();

// 🚀 inicia polling
bot.startPolling({
  restart: true
});

console.log("🔥 DIVULGADOR INTELIGENTE ONLINE");

// 🚀 resolve links encurtados
async function resolverLink(url) {

  try {

    const response = await axios.get(url, {
      maxRedirects: 10,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });

    return response.request.res.responseUrl || url;

  } catch (err) {

    console.log("Erro redirect:", err.message);

    return url;
  }
}

// 🚀 pega produto
async function pegarProduto(link) {

  try {

    const realLink = await resolverLink(link);

    const response = await axios.get(realLink, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",

        "Accept-Language": "pt-BR,pt;q=0.9",

        "Referer": "https://google.com"
      }
    });

    const html = response.data;

    const $ = cheerio.load(html);

    // 🚀 detecta loja
    let loja = "🛒 Loja Online";

    if (
      realLink.includes("mercadolivre") ||
      realLink.includes("meli.la")
    ) {
      loja = "🟡 Mercado Livre";
    }

    if (realLink.includes("amazon")) {
      loja = "🟠 Amazon";
    }

    if (realLink.includes("shopee")) {
      loja = "🟣 Shopee";
    }

    // 🚀 título
    let titulo =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      "🔥 Oferta Imperdível";

    // 🚀 imagem
    let imagem =
      $('meta[property="og:image"]').attr("content");

    // 🚀 preço
    let preco =
      $('meta[property="product:price:amount"]').attr("content");

    // 🚀 fallback preço
    if (!preco) {

      const match = html.match(/"price":\s?([0-9.]+)/);

      if (match) {
        preco = match[1];
      }
    }

    // 🚀 fallback Shopee
    if (realLink.includes("shopee")) {

      const tituloShopee =
        html.match(/"name":"(.*?)"/);

      const imagemShopee =
        html.match(/"image":"(.*?)"/);

      const precoShopee =
        html.match(/"price":"(.*?)"/);

      if (tituloShopee) {
        titulo = tituloShopee[1];
      }

      if (imagemShopee) {
        imagem = imagemShopee[1]
          .replace(/\\u002F/g, "/");
      }

      if (precoShopee) {
        preco = precoShopee[1];
      }
    }

    return {
      titulo,
      preco: preco || "49.90",
      imagem,
      link: realLink,
      loja
    };

  } catch (err) {

    console.log("Erro produto:", err.message);

    return null;
  }
}

// 🚀 START
bot.onText(/\/start/, (msg) => {

  bot.sendMessage(
    msg.chat.id,

`🔥 DIVULGADOR INTELIGENTE 🔥

Envie apenas o link do produto:

✅ Mercado Livre
✅ Shopee
✅ Amazon`
  );
});

// 🚀 mensagens
bot.on("message", async (msg) => {

  try {

    const text = msg.text;

    if (!text) return;

    // ignora comandos
    if (text.startsWith("/")) return;

    // aceita apenas links
    if (!text.startsWith("http")) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Envie apenas o link do produto"
      );
    }

    // loading
    const loading = await bot.sendMessage(
      msg.chat.id,
      "🔎 Procurando produto..."
    );

    // pega produto
    const p = await pegarProduto(text);

    // remove loading
    await bot.deleteMessage(
      msg.chat.id,
      loading.message_id
    );

    // erro produto
    if (!p) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Não consegui ler esse produto"
      );
    }

    // preço
    let precoAtual = parseFloat(p.preco);

    if (isNaN(precoAtual)) {
      precoAtual = 49.90;
    }

    // preço antigo fake
    const precoAntigo =
      (precoAtual * 1.6).toFixed(2);

    // 🚀 envia foto
    if (p.imagem) {

      await bot.sendPhoto(msg.chat.id, p.imagem, {

        caption:
`🔥 ACHADINHO DO DIA 🔥

🏪 ${p.loja}

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
      await bot.sendMessage(

        msg.chat.id,

`🔥 ACHADINHO DO DIA 🔥

🏪 ${p.loja}

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
