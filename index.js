const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
`🌸 Bem-vinda ao Rê Recomenda 🌸

Envie:

/promo LINK

Exemplo:
/promo https://amzn.to/teste`
    );
});

bot.onText(/\/promo (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const link = match[1];

    const mensagem = `
🌸 *RÊ RECOMENDA* 🌸

✨ Oferta especial encontrada!

🛍️ Produto incrível com preço imperdível 💖

🔗 ${link}

🚀 Aproveite antes que acabe!
`;

    bot.sendMessage(chatId, mensagem, {
        parse_mode: 'Markdown'
    });
});
