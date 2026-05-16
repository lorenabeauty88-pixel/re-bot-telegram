const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cheerio = require("cheerio");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

// 🚀 BOT ESTÁVEL
const bot = new TelegramBot(token, {
  polling: {
    autoStart: true,
    interval: 2000
  }
});

console.log("🔥 DIVULGADOR PROFISSIONAL ONLINE");

// =========================
// 🧠 UTIL
// =========================

function detectarLoja(url) {
  if (url.includes("mercadolivre") || url.includes("meli.la"))
    return "🟡 Mercado Livre";

  if (url.includes("shopee"))
    return "🟣 Shopee";

  if (url.includes("amazon"))
    return "🟠 Amazon";

  return "🛒 Loja Online";
}

function limparLink(url) {
  return url.split("?")[0];
}

// =========================
// 🔁 RESOLVER LINK
// =========================

async function resolverLink(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 5,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    return res.request?.res?.responseUrl || url;
  } catch {
    return url;
  }
}

// =========================
// 📦 PRODUTO
// =========================

async function pegarProduto(link) {
  try {
    const realLink = await resolverLink(link);
    const loja = detectarLoja(realLink);

    const res = await axios.get(realLink, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "pt-BR,pt;q=0.9"
      }
    });

    const html = res.data;
    const $ = cheerio.load(html);

    let titulo = "🔥 Oferta Imperdível";
    let imagem = null;
    let preco = 49.9;
    let descricao = "";

    // =========================
    // 🟡 MERCADO LIVRE (ORIGINAL COMO VOCÊ GOSTOU)
    // =========================
    if (loja === "🟡 Mercado Livre") {

      titulo =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text();

      imagem =
        $('meta[property="og:image"]').attr("content");

      descricao =
        $('meta[name="description"]').attr("content") || "";

      const p = html.match(/"price":\s?([0-9.]+)/);
      if (p) preco = parseFloat(p[1]);
    }

    // =========================
    // 🟣 SHOPEE (ESTÁVEL)
    // =========================
    else if (loja === "🟣 Shopee") {

      titulo =
        $('meta[property="og:title"]').attr("content") ||
        "🔥 Produto Shopee";

      imagem =
        $('meta[property="og:image"]').attr("content") ||
        "https://i.imgur.com/placeholder.png";

      descricao =
        $('meta[name="description"]').attr("content") || "";

      const p = html.match(/"price":"(.*?)"/);
      if (p) preco = parseFloat(p[1]);
    }

    // =========================
    // 🟠 AMAZON (FALLBACK SIMPLES)
    // =========================
    else if (loja === "🟠 Amazon") {

      titulo =
        $('meta[property="og:title"]').attr("content") ||
        "🔥 Produto Amazon";

      imagem =
        $('meta[property="og:image"]').attr("content") ||
        "https://i.imgur.com/placeholder.png";

      descricao =
        $('meta[name="description"]').attr("content") || "";

      const p = html.match(/"price":\s?([0-9.]+)/);
      if (p) preco = parseFloat(p[1]);
    }

    return {
      titulo,
      imagem,
      preco,
      descricao,
      link: realLink,
      loja
    };

  } catch (err) {
    console.log("Erro produto:", err.message);
    return null;
  }
}

// =========================
// 🚀 BOT MENSAGEM
// =========================

bot.on("message", async (msg) => {
  try {
    const text = msg.text;

    if (!text || text.startsWith("/")) return;
    if (!text.startsWith("http")) return;

    const loading = await bot.sendMessage(
      msg.chat.id,
      "🔎 Buscando oferta..."
    );

    const p = await pegarProduto(text);

    await bot.deleteMessage(msg.chat.id, loading.message_id);

    if (!p) {
      return bot.sendMessage(msg.chat.id, "❌ Não consegui ler o produto");
    }

    const precoAtual = parseFloat(p.preco) || 49.9;
    const precoAntigo = (precoAtual * 1.6).toFixed(2);

    const caption =
`🔥 RECOMENDAÇÃO PREMIUM 🔥

🏪 ${p.loja}

📦 ${p.titulo}

📝 ${p.descricao ? p.descricao.slice(0, 120) + "..." : "Produto recomendado"}

💰 DE: ~~R$ ${precoAntigo}~~
🔥 POR: R$ ${precoAtual.toFixed(2)}

⚡ Oferta limitada`;

    const imagem = p.imagem || "https://i.imgur.com/placeholder.png";

    await bot.sendPhoto(msg.chat.id, imagem, {
      caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🛒 VER OFERTA",
              url: limparLink(p.link)
            }
          ]
        ]
      }
    });

  } catch (err) {
    console.log("BOT ERROR:", err.message);
    bot.sendMessage(msg.chat.id, "❌ Erro ao processar produto");
  }
});
