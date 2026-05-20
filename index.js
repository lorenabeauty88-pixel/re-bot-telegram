const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN não configurado!");
  process.exit(1);
}

// INICIA BOT
const bot = new TelegramBot(token, {
  polling: true
});

console.log("🤖 BOT CONECTADO COM POLLING");

// START
bot.onText(/\/start/, async (msg) => {

  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
`🔥 BOT DE ACHADINHOS 🔥

Envie um link do Mercado Livre assim:

/promo https://meli.la/xxxxx`
  );
});

// PROMO
bot.onText(/\/promo (.+)/, async (msg, match) => {

  const chatId = msg.chat.id;

  try {

    // LINK
    let link = match[1].trim();

    // CORRIGE LINK
    if (
      !link.startsWith("http://") &&
      !link.startsWith("https://")
    ) {
      link = "https://" + link;
    }

    // MSG BUSCA
    await bot.sendMessage(
      chatId,
      "🔎 Buscando produto..."
    );

    // PRIMEIRA REQUISIÇÃO
    const redirectResponse = await axios.get(link, {

      maxRedirects: 10,

      validateStatus: () => true,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36"
      },

      timeout: 20000
    });

    // URL FINAL
    const finalUrl =
      redirectResponse.request?.res?.responseUrl || link;

    // SEGUNDA REQUISIÇÃO
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

    // HTML
    const html =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);

    // TITULO
    const titulo =
      html.match(/<title>(.*?)<\/title>/i)?.[1]
        ?.replace(" | Mercado Livre Brasil", "")
        ?.replace(" | Mercado Livre", "")
        ?.trim() || "Produto";

    // IMAGEM
    const imagem =
      html.match(/"og:image" content="(.*?)"/i)?.[1];

    // PREÇO
    const preco =
      html.match(/"price":"(.*?)"/i)?.[1];

    // PREÇO ANTIGO
    const precoAntigo =
      html.match(/"originalPrice":"(.*?)"/i)?.[1];

    // DESCONTO
    let desconto = "";

    if (preco && precoAntigo) {

      const atual = parseFloat(preco);
      const antigo = parseFloat(precoAntigo);

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
`📊 DESCONTO: ${porcentagem}%`;
      }
    }

    // MENSAGEM
    const mensagem =
`✨🔥 ACHADINHO DO DIA 🔥✨

🛒 Mercado Livre

📦 ${titulo}

⚡ Oferta imperdível

💰 DE: ~~R$ ${precoAntigo || "---"}~~
🔥 POR: R$ ${preco || "---"}

${desconto}

🚨 Promoção por tempo limitado

👇 Clique abaixo para aproveitar`;

    // ENVIA FOTO
    if (imagem) {

      await bot.sendPhoto(
        chatId,
        imagem,
        {

          caption: mensagem,

          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🛒 VER OFERTA AGORA",
                  url: finalUrl
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
        mensagem,
        {

          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🛒 VER OFERTA AGORA",
                  url: finalUrl
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

// ERROS
bot.on("polling_error", (err) => {

  console.error(
    "Polling error:",
    err.message
  );
});
