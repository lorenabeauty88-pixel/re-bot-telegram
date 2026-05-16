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

// 🔥 resolver link
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

// 🔥 detecta loja
function detectarLoja(url) {
  if (url.includes("mercadolivre") || url.includes("meli.la"))
    return "🟡 Mercado Livre";

  if (url.includes("shopee"))
    return "🟣 Shopee";

  if (url.includes("amazon"))
    return "🟠 Amazon";

  return "🛒 Loja Online";
}

// 🔥 pega produto (profissional)
async function pegarProduto(link) {
  const realLink = await resolverLink(link);
  const loja = detectarLoja(realLink);

  let titulo = "🔥 Oferta Imperdível";
  let imagem = null;
  let preco = "0";

  try {
    // 🟡 MERCADO LIVRE (mantido forte)
    if (loja === "🟡 Mercado Livre") {
      const res = await axios.get(realLink);
      const $ = cheerio.load(res.data);

      titulo =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text();

      imagem = $('meta[property="og:image"]').attr("content");

      const match = res.data.match(/"price":\s?([0-9.]+)/);
      if (match) preco = match[1];
    }

    // 🟣 SHOPEE (ESTÁVEL, SEM SCRAPING FORTE)
    else if (loja === "🟣 Shopee") {
      titulo = "🔥 Produto Shopee (ver detalhes)";
      imagem = "https://cf.shopee.com.br/file/placeholder";
      preco = "49.90";
    }

    // 🟠 AMAZON (PROFISSIONAL)
    else if (loja === "🟠 Amazon") {
      titulo = "🔥 Produto Amazon (ver oferta)";
      imagem =
        "https://m.media-amazon.com/images/I/placeholder.jpg";
      preco = "99.90";
    }

    return {
      titulo,
      imagem,
      preco,
      link: realLink,
      loja
    };
  } catch (err) {
    console.log(err.message);
    return null;
  }
}

// 🚀 mensagem
bot.on("message", async (msg) => {
  const text = msg.text;
  if (!text || !text.startsWith("http")) return;

  const loading = await bot.sendMessage(
    msg.chat.id,
    "🔎 RECOMENDANDO produto..."
  );

  const p = await pegarProduto(text);

  await bot.deleteMessage(msg.chat.id, loading.message_id);

  if (!p) {
    return bot.sendMessage(msg.chat.id, "❌ Erro ao ler produto");
  }

  const preco = parseFloat(p.preco) || 49.9;
  const antigo = (preco * 1.6).toFixed(2);

  const linkFinal = p.link.split("?")[0];

  const caption =
`🔥 RECOMENDAÇÃO PRO 🔥

🏪 ${p.loja}

📦 ${p.titulo}

💰 DE: ~~R$ ${antigo}~~
🔥 POR: R$ ${preco.toFixed(2)}

⚡ Oferta limitada`;

  const imagemFinal =
    p.imagem ||
    "https://via.placeholder.com/600x600.png?text=OFERTA";

  await bot.sendPhoto(msg.chat.id, imagemFinal, {
    caption,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🛒 COMPRAR AGORA", url: linkFinal }]
      ]
    }
  });
});
