const axios = require("axios");

// extrai ID do link do Mercado Livre
function extrairId(url) {
  const match = url.match(/MLB-\d+/);
  return match ? match[0] : null;
}

async function getProdutoML(link) {

  const id = extrairId(link);

  if (!id) {
    return "❌ Link inválido do Mercado Livre";
  }

  const url = `https://api.mercadolibre.com/items/${id}`;

  const res = await axios.get(url);

  const p = res.data;

  const preco = p.price;
  const imagem = p.pictures?.[0]?.url;
  const nome = p.title;
  const linkAfiliado = p.permalink;

  return `
🔥 ACHADINHO MERCADO LIVRE 🔥

📦 ${nome}

💰 R$ ${preco.toFixed(2)}

🛒 ${linkAfiliado}

🖼️ ${imagem}
`;
}
