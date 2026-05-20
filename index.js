const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não configurado");
  process.exit(1);
}

// INICIA BOT
const bot = new TelegramBot(token, {
  polling: true
});

console.log("🤖 BOT ONLINE");

// START
bot.onText(/\/start/, async (msg) => {

  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
`🔥 BOT DE ACHADINHOS 🔥

Envie um link assim:

/promo LINK_DO_PRODUTO

Exemplo:

/promo https://produto.mercadolivre.com.br/...`
  );
});

// PROMO
bot.onText(/\/promo (.+)/, async (msg, match) => {

  const chatId = msg.chat.id;

  try {

    let link = match[1].trim();

    // ADICIONA HTTPS
    if (
      !link.startsWith("http://") &&
      !link.startsWith("https://")
    ) {
      link = "https://" + link;
    }

    // MSG
    await bot.sendMessage(
      chatId,
      "🔎 Buscando produto..."
    );

    // PEGA HTML
    const response = await axios.get(link, {

      maxRedirects: 5,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36"
      },

      timeout: 15000
    });

    const html =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);

    // TÍTULO
    let titulo =
      html.match(/<title>(.*?)<\/title>/i)?.[1] ||
      "Produto";

    titulo = titulo
      .replace(" | Mercado Livre Brasil", "")
      .replace(" | Mercado Livre", "")
      .replace(" | Amazon.com.br", "")
      .replace(" | Shopee Brasil", "")
      .trim();

    // IMAGEM
    const imagem =
      html.match(/property="og:image" content="(.*?)"/i)?.[1] ||
      html.match(/"og:image" content="(.*?)"/i)?.[1];

    // PREÇO
    let preco =
      html.match(/"price":"(.*?)"/i)?.[1] ||
      html.match(/"price":(.*?),/i)?.[1] ||
      "---";

    // PREÇO ANTIGO
    let precoAntigo =
      html.match(/"originalPrice":"(.*?)"/i)?.[1] ||
      "---";

    // DESCONTO
    let desconto = "";

    const atual =
      parseFloat(
        preco.toString().replace(",", ".")
      );

    const antigo =
      parseFloat(
        precoAntigo.toString().replace(",", ".")
      );

    if (
      !isNaN(atual) &&
      !isNaN(antigo) &&
      antigo > atual
    ) {

      const porcentagem =
        Math.round(
          ((antigo - atual) / antigo) * 100
        );

      desconto =
`📊 ${porcentagem}% OFF`;
    }

    // LOJA
    let loja = "🛒 Loja Online";

    if (link.includes("mercadolivre")) {
      loja = "🟨 Mercado Livre";
    }

    if (link.includes("amazon")) {
      loja = "🟦 Amazon";
    }

    if (link.includes("shopee")) {
      loja = "🟧 Shopee";
    }

    if (link.includes("shein")) {
      loja = "⬛ Shein";
    }

    // TEXTO
    const legenda =
`✨🔥 OFERTA IMPERDÍVEL 🔥✨

${loja}

📦 ${titulo}

💸 De: ~~R$ ${precoAntigo}~~
🔥 Por: R$ ${preco}

${desconto}

🚨 Promoção por tempo limitado

👇 Clique abaixo para comprar`;

    // ENVIA FOTO
    if (imagem) {

      await bot.sendPhoto(
        chatId,
        imagem,
        {

          caption: legenda,

          reply_markup: {

            inline_keyboard: [
              [
                {
                  text: "🛒 COMPRAR AGORA",
                  url: encodeURI(link)
                }
              ]
            ]
          }
        }
      );

    } else {

      // ENVIA TEXTO
      await bot.sendMessage(
        chatId,
        legenda,
        {

          reply_markup: {

            inline_keyboard: [
              [
                {
                  text: "🛒 COMPRAR AGORA",
                  url: encodeURI(link)
                }
              ]
            ]
          }
        }
      );
    }

  } catch (error) {

    console.log(
      "❌ ERRO:",
      error.message
    );

    await bot.sendMessage(
      chatId,
      "❌ Não consegui pegar esse produto.\nTente outro link."
    );
  }
});

// ERROS
bot.on("polling_error", (err) => {

  console.log(
    "❌ POLLING:",
    err.message
  );
});
