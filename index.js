const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cheerio = require("cheerio");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

// =========================
// 🚀 BOT ESTÁVEL
// =========================
const bot = new TelegramBot(token, {
  polling: true
});

console.log("🔥 DIVULGADOR PROFISSIONAL ONLINE");

bot.on("polling_error", (err) => {
  console.log("⚠ polling_error:", err.message);
});

// =========================
// 🧠 DETECTAR LOJA
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
// 🖼 FALLBACK IMAGEM
// =========================
function fallbackImagem(loja) {
  if (loja === "🟠 Amazon")
    return "https://m.media-amazon.com/images/I/placeholder.jpg";

  if (loja === "🟣 Shopee")
    return "https://cf.shopee.com.br/file/placeholder";

  return "https://i.imgur.com/placeholder.png";
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

    // =========================
    // 🟡 MERCADO LIVRE (INTACTO)
    // =========================
    if (loja === "🟡 Mercado Livre") {
      const titulo =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text();

      const imagem =
        $('meta[property="og:image"]').attr("content");

      const descricao =
        $('meta[name="description"]').attr("content") || "";

      const precoMatch = html.match(/"price":\s?([0-9.]+)/);

      return {
        titulo,
        imagem,
        preco: precoMatch ? parseFloat(precoMatch[1]) : 49.9,
        descricao,
        link: realLink,
        loja
      };
    }

    // =========================
    // 🟣 SHOPEE
    // =========================
    if (loja === "🟣 Shopee") {
      let titulo =
        $('meta[property="og:title"]').attr("content") ||
        "🔥 Produto Shopee";

      let imagem =
        $('meta[property="og:image"]').attr("content");

      let descricao =
        $('meta[name="description"]').attr("content") || "";

      let precoMatch = html.match(/"price":"(.*?)"/);

      if (!imagem || imagem.includes("not viewable")) {
        imagem = fallbackImagem(loja);
      }

      return {
        titulo,
        imagem,
        preco: precoMatch ? parseFloat(precoMatch[1]) : 49.9,
        descricao,
        link: realLink,
        loja
      };
    }

    // =========================
    // 🟠 AMAZON
    // =========================
    if (loja === "🟠 Amazon") {
      let titulo =
        $('meta[property="og:title"]').attr("content") ||
        "🔥 Produto Amazon";

      let imagem =
        $('meta[property="og:image"]').attr("content");

      let descricao =
        $('meta[name="description"]').attr("content") || "";

      let precoMatch = html.match(/"price":\s?([0-9.]+)/);

      if (!imagem || imagem.includes("not viewable")) {
        imagem = fallbackImagem(loja);
      }

      return {
        titulo,
        imagem,
        preco: precoMatch ? parseFloat(precoMatch[1]) : 49.9,
        descricao,
        link: realLink,
        loja
      };
    }

    return null;

  } catch (err) {
    console.log("❌ Erro produto:", err.message);
    return null;
  }
}

// =========================
// 🚀 MENSAGEM
// =========================
bot.on("message", async (msg) => {
  try {
    const text = msg.text;

    if (!text || text.startsWith("/")) return;
    if (!text.startsWith("http")) return;

    const loading = await bot.sendMessage(msg.chat.id, "🔎 Buscando oferta...");

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

📝 ${p.descricao ? p.descricao.slice(0, 120) + "..." : ""}

💰 DE: ~~R$ ${precoAntigo}~~
🔥 POR: R$ ${precoAtual.toFixed(2)}

⚡ Oferta limitada`;

    await bot.sendPhoto(msg.chat.id, p.imagem, {
      caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🛒 VER OFERTA",
              url: p.link.split("?")[0]
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
