const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cheerio = require("cheerio");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🔥 DIVULGADOR PROFISSIONAL ONLINE");

// 🔥 limpar link (IMPORTANTE)
function limparLink(url) {
  return url.split("?")[0];
}

// 🔥 resolver redirects
async function resolverLink(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 10,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    return res.request.res.responseUrl || url;
  } catch {
    return url;
  }
}

// 🔥 detectar loja
function detectarLoja(url) {
  if (url.includes("mercadolivre") || url.includes("meli.la"))
    return "🟡 Mercado Livre";

  if (url.includes("shopee"))
    return "🟣 Shopee";

  if (url.includes("amazon"))
    return "🟠 Amazon";

  return "🛒 Loja Online";
}

// 🔥 pegar produto
async function pegarProduto(link) {
  try {
    const realLink = await resolverLink(link);
    const loja = detectarLoja(realLink);

    let titulo = "🔥 Oferta Imperdível";
    let imagem = null;
    let preco = "49.90";

    const res = await axios.get(realLink, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = res.data;
    const $ = cheerio.load(html);

    // 🟡 MERCADO LIVRE (NÃO ALTERADO)
    if (loja === "🟡 Mercado Livre") {

      const t = html.match(/"name":"(.*?)"/);
      const p = html.match(/"price":\s?([0-9.]+)/);
      const i = html.match(/"image":"(.*?)"/);

      if (t) titulo = t[1];
      if (p) preco = p[1];
      if (i) imagem = i[1].replace(/\\u002F/g, "/");
    }

    // 🟣 SHOPEE (CORRIGIDO)
    else if (loja === "🟣 Shopee") {

      titulo =
        $('meta[property="og:title"]').attr("content") ||
        "🔥 Produto Shopee";

      imagem =
        $('meta[property="og:image"]').attr("content") ||
        "https://i.imgur.com/placeholder.png";

      const match = html.match(/"price":"(.*?)"/);
      if (match) preco = match[1];
    }

    // 🟠 AMAZON (ESTÁVEL)
    else if (loja === "🟠 Amazon") {

      titulo =
        $('meta[property="og:title"]').attr("content") ||
        "🔥 Produto Amazon";

      imagem =
        $('meta[property="og:image"]').attr("content") ||
        "https://i.imgur.com/placeholder.png";

      const match = html.match(/"price":\s?([0-9.]+)/);
      if (match) preco = match[1];
    }

    return {
      titulo,
      imagem,
      preco,
      link: realLink,
      loja
    };

  } catch (err) {
    console.log("Erro produto:", err.message);
    return null;
  }
}

// 🚀 mensagens
bot.on("message", async (msg) => {
  const text = msg.text;

  if (!text || text.startsWith("/")) return;
  if (!text.startsWith("http")) return;

  const loading = await bot.sendMessage(
    msg.chat.id,
    "🔎 RECOMENDANDO produto..."
  );

  const p = await pegarProduto(text);

  await bot.deleteMessage(msg.chat.id, loading.message_id);

  if (!p) {
    return bot.sendMessage(msg.chat.id, "❌ Não consegui ler o produto");
  }

  const precoAtual = parseFloat(p.preco) || 49.9;
  const precoAntigo = (precoAtual * 1.6).toFixed(2);

  const linkFinal = limparLink(p.link);

  const caption =
`🔥 RECOMENDAÇÃO DO DIA 🔥

🏪 ${p.loja}

📦 ${p.titulo}

💰 DE: ~~R$ ${precoAntigo}~~
🔥 POR: R$ ${precoAtual.toFixed(2)}

⚡ Oferta limitada`;

  const imagemFinal =
    p.imagem || "https://i.imgur.com/placeholder.png";

  await bot.sendPhoto(msg.chat.id, imagemFinal, {
    caption,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🛒 COMPRAR AGORA",
            url: linkFinal
          }
        ]
      ]
    }
  });
});
