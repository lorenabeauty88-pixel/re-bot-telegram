bot.sendPhoto(chatId, foto, {
  caption:
`🔥 OFERTA RELÂMPAGO 🔥

💸 Desconto especial
🚚 Frete rápido
⏰ Tempo limitado

👉 Clique abaixo para aproveitar`,
  reply_markup: {
    inline_keyboard: [
      [{ text: "🛒 COMPRAR AGORA", url: link }]
    ]
  }
});
