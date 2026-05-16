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

// =========================
// 🧠 DETECTA LOJA
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
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "pt-BR,pt;q=0.9",
        "Referer": "https://google.com"
      }
    });

    const html = res.data;
    const $ = cheerio.load(html);

    // =========================
    // 🟡 MERCADO LIVRE (FUNCIONANDO)
    // =========================
    if (loja === "🟡 Mercado Livre") {
      const titulo =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text();

      const imagem =
        $('meta[property="og:image"]').attr("content") ||
        fallbackImagem(loja);

      const descricao =
        $('meta[name="description"]').attr("content") || "";

      const preco =
        html.match(/"price":\s*([0-9.]+)/)?.[1] ||
        html.match(/"amount":\s*([0-9.]+)/)?.[1];

      return {
        titulo,
        imagem,
        descricao,
        preco: preco ? parseFloat(preco) : 49.9,
        link: realLink,
        loja
      };
    }

    // =========================
    // 🟣 SHOPEE (SAFE MODE)
    // =========================
    if (loja === "🟣 Shopee") {
      return {
        titulo: "🔥 Produto Shopee",
        imagem: fallbackImagem(loja),
        descricao: "",
        preco: 49.9,
        link: realLink,
        loja
      };
    }

    // =========================
    // 🟠 AMAZON (SAFE MODE)
    // =========================
    if (loja === "🟠 Amazon") {
      return {
        titulo: "🔥 Produto Amazon",
        imagem: fallbackImagem(loja),
        descricao: "",
        preco: 49.9,
        link: realLink,
        loja
      };
    }

    return null;

  } catch (err) {
    console.log("❌ ERRO:", err.message);
    return null;
  }
}

// =========================
// 🚀 MENSAGENS
// =========================
bot.on("message", async (msg) => {
  try {
    const text = msg.text;

    if (!text || text.startsWith("/")) return;
    if (!text.startsWith("http")) return;

    const loading = await bot.sendMessage(
      msg.chat.id,
      "🔎 Buscando produto..."
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
