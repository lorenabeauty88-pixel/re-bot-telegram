const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

// BOT
const bot = new TelegramBot(token, {
  polling: true
});

console.log("🤖 BOT ONLINE");

// START
bot.onText(/\/start/, async (msg) => {

  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
`🔥 BOT DIVULGADOR INTELIGENTE 🔥

Envie links de produtos assim:

/promo LINK

Exemplo:
/promo https://produto.mercadolivre.com.br/...`
  );
});

// PROMO
bot.onText(/\/promo (.+)/, async (msg, match) => {

  const chatId = msg.chat.id;

  try {

    let link = match[1].trim();

    // CORRIGE LINK
    if (
      !link.startsWith("http://") &&
      !link.startsWith("https://")
    ) {
      link = "https://" + link;
    }

    await bot.sendMessage(
      chatId,
      "🔎 Buscando produto..."
    );

    // PEGA URL FINAL
    const redirectResponse = await axios.get(link, {

      maxRedirects: 10,

      validateStatus: () => true,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36"
      },

      timeout: 20000
    });

    // LINK FINAL
    const finalUrl =
      redirectResponse.request?.res?.responseUrl || link;

    // HTML FINAL
    const response = await axios.get(finalUrl, {

      maxRedirects: 10,

      validateStatus: () => true,

      headers: {

        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",

        "Accept-Language":
          "pt-BR,pt;q=0.9",

        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",

        "Referer":
          "https://www.google.com/"
      },

      timeout: 20000
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
      html.match(/"og:image" content="(.*?)"/i)?.[1] ||
      html.match(/property="og:image" content="(.*?)"/i)?.[1];

    // PREÇO
    let preco =
      html.match(/"price":"(.*?)"/i)?.[1] ||
      html.match(/"price":(.*?),/i)?.[1];

    // PREÇO ANTIGO
    let precoAntigo =
      html.match(/"originalPrice":"(.*?)"/i)?.[1];

    // DESCONTO
    let desconto = "";

    if (preco && precoAntigo) {

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
    }

    // IDENTIFICA PLATAFORMA
    let loja = "🛒 Loja Online";

    if (finalUrl.includes("mercadolivre")) {
      loja = "🟨 Mercado Livre";
    }

    if (finalUrl.includes("amazon")) {
      loja = "🟦 Amazon";
    }

    if (finalUrl.includes("shopee")) {
      loja = "🟧 Shopee";
    }

    if (finalUrl.includes("shein")) {
      loja = "⬛ Shein";
    }

    // MENSAGEM
    const mensagem =
`✨🔥 ACHADINHO ENCONTRADO 🔥✨

${loja}

📦 ${titulo}

💸 De: ~~R$ ${precoAntigo || "---"}~~
🔥 Por: R$ ${preco || "---"}

${desconto}

🚨 Promoção por tempo limitado

👇 Clique abaixo para comprar`;

    // FOTO
    if (imagem) {

      await bot.sendPhoto(
        chatId,
        imagem,
        {

          caption: mensagem,

          parse_mode: "Markdown",

          reply_markup: {

            inline_keyboard: [
              [
                {
                  text: "🛒 COMPRAR AGORA",
                  url: encodeURI(finalUrl)
                }
              ]
            ]
          }
        }
      );

    } else {

      // TEXTO
      await bot.sendMessage(
        chatId,
        mensagem,
        {

          reply_markup: {

            inline_keyboard: [
              [
                {
                  text: "🛒 COMPRAR AGORA",
                  url: encodeURI(finalUrl)
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
      "❌ Não consegui encontrar esse produto."
    );
  }
});

// ERRO POLLING
bot.on("polling_error", (err) => {

  console.log(
    "❌ POLLING:",
    err.message
  );
});
