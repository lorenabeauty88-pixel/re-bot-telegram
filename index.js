const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não configurado");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("🤖 BOT ONLINE");

// 🔥 PRODUTOS (ACHADINHOS)
const produtos = [
  {
    nome: "Fone Bluetooth X15",
    preco: "R$ 29,90",
    imagem: "https://i.imgur.com/2s9XK4p.jpeg",
    link: "https://seulinkafiliado.com/1"
  },
  {
    nome: "Mini Caixa de Som LED",
    preco: "R$ 39,90",
    imagem: "https://i.imgur.com/2s9XK4p.jpeg",
    link: "https://seulinkafiliado.com/2"
  },
  {
    nome: "Smart Watch Ultra",
    preco: "R$ 59,90",
    imagem: "https://i.imgur.com/2s9XK4p.jpeg",
    link: "https://seulinkafiliado.com/3"
  }
];

// ✔️ START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
`🔥 ACHADINHOS VIRAL BOT 🔥

Comandos:
/produto - ver oferta aleatória
/lista - ver catálogo`
  );
});

// 🎲 PRODUTO ALEATÓRIO
bot.onText(/\/produto/, (msg) => {
  const chatId = msg.chat.id;

  const p = produtos[Math.floor(Math.random() * produtos.length)];

  bot.sendPhoto(chatId, p.imagem, {
    caption:
`🔥 ACHADINHO DO DIA 🔥

📦 ${p.nome}
💰 ${p.preco}

⚡ Oferta limitada!`,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🛒 COMPRAR AGORA",
            url: p.link
          }
        ]
      ]
    }
  });
});

// 📋 LISTA
bot.onText(/\/lista/, (msg) => {
  const chatId = msg.chat.id;

  let texto = "🔥 CATÁLOGO DE ACHADINHOS 🔥\n\n";

  produtos.forEach((p, i) => {
    texto += `${i + 1}. ${p.nome} - ${p.preco}\n`;
  });

  bot.sendMessage(chatId, texto);
});

// 💬 qualquer mensagem
bot.on("message", (msg) => {
  if (msg.text && !msg.text.startsWith("/")) {
    bot.sendMessage(msg.chat.id, "🔥 Use /produto para ver ofertas");
  }
});
