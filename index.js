const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cheerio = require("cheerio");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

// 🚀 BOT
const bot = new TelegramBot(token, { polling: true });

console.log("🔥 DIVULGADOR INTELIGENTE ONLINE");

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

// 🔥 pegar produto
async function pegarProduto(link) {
  try {
    const realLink = await resolverLink(link);

    const res = await axios.get(realLink, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "pt-BR,pt;q=0.9"
      }
    });

    const html = res.data;
    const $ = cheerio.load(html);

    // 🏪 loja
    let loja = "🛒 Loja Online";

    if (realLink.includes("mercadolivre") || realLink.includes("meli.la")) {
      loja = "🟡 Mercado Livre";
    } else if (realLink.includes("shopee")) {
      loja = "🟣 Shopee";
    } else if (realLink.includes("amazon")) {
      loja = "🟠 Amazon";
    }

    // 📦 título
    let titulo =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      "🔥 Oferta Imperdível";

    // 🖼 imagem
    let imagem =
      $('meta[property="og:image"]').attr("content");

    // 💰 preço
    let preco =
      $('meta[property="product:price:amount"]').attr("content");

    if (!preco) {
      const match = html.match(/"price":\s?([0-9.]+)/);
      if (match) preco = match[1];
    }

    // 🟡 MERCADO LIVRE (NÃO MEXIDO)
    if (realLink.includes("mercadolivre") || realLink.includes("meli.la")) {
      const t = html.match(/"name":"(.*?)"/);
      const p = html.match(/"price":\s?([0-9.]+)/);
      const i = html.match(/"image":"(.*?)"/);

      if (t) titulo = t[1];
      if (p) preco = p[1];
      if (i) imagem = i[1].replace(/\\u002F/g, "/");
    }

    // 🟣 SHOPEE (corrigido)
    if (realLink.includes("shopee")) {
      const t = html.match(/"name":"(.*?)"/);
      const i = html.match(/"image":"(.*?)"/);
      const p = html.match(/"price":"(.*?)"/);

      if (t) titulo = t[1];
      if (i) imagem = i[1].replace(/\\u002F/g, "/");
      if (p) preco = p[1];
    }

    if (!preco) preco = "49.90";

    return {
      titulo,
      preco,
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
`🔥 DIVULGADOR INTELIGENTE PRO 🔥

Envie o link do produto:

🟡 Mercado Livre
🟣 Shopee
🟠 Amazon`
  );
});

// 🚀 mensagens
bot.on("message", async (msg) => {
  const text = msg.text;

  if (!text || text.startsWith("/")) return;
  if (!text.startsWith("http")) return;

  const loading = await bot.sendMessage(msg.chat.id, "🔎 RECOMENDA procurando oferta...");

  const p = await pegarProduto(text);

  await bot.deleteMessage(msg.chat.id, loading.message_id);

  if (!p) {
    return bot.sendMessage(msg.chat.id, "❌ Não consegui ler esse produto");
  }

  const precoAtual = parseFloat(p.preco) || 49.9;
  const precoAntigo = (precoAtual * 1.6).toFixed(2);

  const linkFinal = p.link.split("?")[0];

  // 💥 MENSAGEM PADRÃO PRO
  const caption =
`🔥 RECOMENDAÇÃO DO DIA 🔥

🏪 ${p.loja}

📦 ${p.titulo}

💰 DE: ~~R$ ${precoAntigo}~~
🔥 POR: R$ ${precoAtual.toFixed(2)}

⚡ RECOMENDAÇÃO ESPECIAL
⏳ Oferta por tempo limitado`;

  // 🚀 IMAGEM FORÇADA (NUNCA SEPARA MENSAGEM)
  const imagemFinal =
    p.imagem ||
    "https://via.placeholder.com/600x600.png?text=ACHADINHO+DO+DIA";

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
