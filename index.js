const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT ACHADINHOS ONLINE");

// 🚀 COMANDO START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🔥 BOT ACHADINHOS 🔥

Envie assim:

PREÇO
LINK
IMAGEM

EXEMPLO:

49.90
https://meli.la/xxxxx
https://i.imgur.com/teste.jpg`
  );
});

// 🚀 MENSAGENS
bot.on("message", async (msg) => {
  try {
    const text = msg.text;

    if (!text) return;

    // ignora comandos
    if (text.startsWith("/")) return;

    const partes = text.split("\n");

    // agora só precisa 3 linhas
    if (partes.length < 3) {
      return bot.sendMessage(
        msg.chat.id,
        "❌ Envie:\n\nPREÇO\nLINK\nIMAGEM"
      );
    }

    const preco = parseFloat(partes[0]);
    const link = partes[1];
    const imagem = partes[2];

    // nome automático
    const nome = "🔥 OFERTA IMPERDÍVEL";

    if (!preco || !link || !imagem) {
      return bot.sendMessage(
        msg.chat.id,
        "❌ Dados inválidos"
      );
    }

    // preço fake antigo
    const precoAntigo = (preco * 1.6).toFixed(2);

    // envia achadinho
    await bot.sendPhoto(msg.chat.id, imagem, {
      caption: `🔥 ACHADINHO DO DIA 🔥

📦 ${nome}

💰 DE: ~~R$ ${precoAntigo}~~
🔥 POR: R$ ${preco.toFixed(2)}

📉 DESCONTO IMPERDÍVEL

⚡ Clique no botão abaixo`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🛒 COMPRAR AGORA",
              url: link
            }
          ]
        ]
      }
    });

  } catch (err) {
    console.log("ERRO:", err.message);

    bot.sendMessage(
      msg.chat.id,
      "❌ Erro ao criar achadinho"
    );
  }
});
