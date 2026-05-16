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

console.log("🔥 DIVULGADOR PROFISSIONAL ONLINE");

// =========================
// 🧠 LOJA
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
// 🔁 LINK
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
// 💎 COPY INTELIGENTE
// =========================
function gerarCopy(p, precoAtual, precoAntigo) {

  const desconto = ((precoAntigo - precoAtual) / precoAntigo) * 100;

  let vibe = "normal";

  if (desconto >= 60) vibe = "ultra";
  else if (desconto >= 40) vibe = "alto";
  else if (desconto >= 20) vibe = "medio";

  if (vibe === "ultra") {
    return `🚨🔥 OFERTA INSANA LIBERADA 🔥🚨

🏪 ${p.loja}

📦 ${p.titulo}

💣 DESCONTO IMPERDÍVEL HOJE

💰 DE: ~~R$ ${precoAntigo}~~
🔥 POR: *R$ ${precoAtual.toFixed(2)}*

⚠️ Pode acabar a qualquer momento

👇 GARANTIR AGORA`;
  }

  if (vibe === "alto") {
    return `🔥 ACHADINHO MUITO BOM 🔥

🏪 ${p.loja}

📦 ${p.titulo}

💰 DE: ~~R$ ${precoAntigo}~~
🔥 POR: *R$ ${precoAtual.toFixed(2)}*

📉 ÓTIMO DESCONTO HOJE

👇 Ver oferta`;
  }

  if (vibe === "medio") {
    return `✨ RECOMENDAÇÃO DO DIA ✨

🏪 ${p.loja}

📦 ${p.titulo}

💰 Por apenas *R$ ${precoAtual.toFixed(2)}*

👇 Confira`;
  }

  return `🛒 PRODUTO EM DESTAQUE

🏪 ${p.loja}

📦 ${p.titulo}

💰 R$ ${precoAtual.toFixed(2)}

👇 Ver oferta`;
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
    // 🟣 SHOPEE (SAFE)
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
    // 🟠 AMAZON (SAFE)
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
// 🚀 MENSAGEM
// =========================
bot.on("message", async (msg) => {
  try {

    const text = msg.text;
    if (!text || text.startsWith("/")) return;
    if (!text.startsWith("http")) return;

    const loading = await bot.sendMessage(msg.chat.id, "🔎 Buscando produto...");

    const p = await pegarProduto(text);

    await bot.deleteMessage(msg.chat.id, loading.message_id);

    if (!p) {
      return bot.sendMessage(msg.chat.id, "❌ Não consegui ler o produto");
    }

    const precoAtual = parseFloat(p.preco) || 49.9;
    const precoAntigo = (precoAtual * 1.6).toFixed(2);

    const caption = gerarCopy(p, precoAtual, precoAntigo);

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
