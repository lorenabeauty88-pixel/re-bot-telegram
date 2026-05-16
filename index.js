const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT ACHADINHOS ONLINE");

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🔥 BOT ACHADINHOS VIRAL 🔥

Envie assim:

nome do produto
preço
link
imagem

EXEMPLO:

Fone Bluetooth Gamer
49.90
https://meli.la/xxxxx
https://i.imgur.com/teste.jpg`
  );
});

// mensagens
bot.on("message", async (msg) => {
  try {
    const text = msg.text;

    if (!text) return;

    // ignora comandos
    if (text.startsWith("/")) return;

    const partes = text.split("\n");

    if (partes.length < 4) {
      return bot.sendMessage(
        msg.chat.id,
        "❌ Envie:\n\nnome\npreço\nlink\nimagem"
      );
    }

    const nome = partes[0];
    const preco = parseFloat(partes[1]);
    const link = partes[2];
    const imagem = partes[3];

    if (!nome || !preco || !link || !imagem) {
      return bot.sendMessage(
        msg.chat.id,
        "❌ Dados inválidos"
      );
    }

    const precoAntigo = (preco * 1.6).toFixed(2);

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
