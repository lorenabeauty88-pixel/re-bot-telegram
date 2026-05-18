const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN não configurado!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🤖 BOT CONECTADO COM POLLING");

bot.onText(/\/start/, async (msg) => {

  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
`🔥 BOT DE ACHADINHOS ONLINE 🔥

Envie um link assim:

/promo https://meli.la/xxxxx`
  );
});

bot.onText(/\/promo (.+)/, async (msg, match) => {

  const chatId = msg.chat.id;
  const link = match[1];

  try {

    await bot.sendMessage(
      chatId,
      "🔎 Buscando produto..."
    );

    const response = await axios.get(link, {
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const html = response.data;

    const titulo =
      html.match(/<title>(.*?)<\/title>/i)?.[1]
      ?.replace(" | Mercado Livre Brasil", "")
      ?.replace(" | Mercado Livre", "")
      ?.trim() || "Produto";

    const imagem =
      html.match(/"og:image" content="(.*?)"/i)?.[1];

    const preco =
      html.match(/"price":"(.*?)"/i)?.[1];

    const precoAntigo =
      html.match(/"originalPrice":"(.*?)"/i)?.[1];

    let desconto = "";

    if (preco && precoAntigo) {

      const atual = parseFloat(preco);
      const antigo = parseFloat(precoAntigo);

      const porcentagem =
        Math.round(
          ((antigo - atual) / antigo) * 100
        );

      desconto =
`📊 DESCONTO: ${porcentagem}%`;
    }

    const mensagem =
`⭐✨ BOM ✨⭐

🛒 Mercado Livre

📦 ${titulo}

⚡ Boa oferta

💸 DE: ~~R$ ${precoAntigo || "---"}~~
🔥 POR: R$ ${preco || "---"}

${desconto}

⚠️ Oferta pode acabar a qualquer momento

👇 Clique abaixo e aproveite agora`;

    if (imagem) {

      await bot.sendPhoto(chatId, imagem, {
        caption: mensagem,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🛒 VER OFERTA AGORA",
                url: link
              }
            ]
          ]
        }
      });

    } else {

      await bot.sendMessage(
        chatId,
        mensagem,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🛒 VER OFERTA AGORA",
                  url: link
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

    bot.sendMessage(
      chatId,
      "❌ Não consegui pegar esse produto."
    );
  }
});

bot.on("polling_error", (err) => {
  console.error("Polling error:", err.message);
});
