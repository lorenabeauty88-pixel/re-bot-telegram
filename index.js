const axios = require("axios");

async function resolverLink(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 5
    });

    return res.request.res.responseUrl || url;
  } catch (e) {
    return url;
  }
}

function extrairId(url) {
  const match = url.match(/MLB\d+/i);
  if (!match) return null;
  return match[0];
}

async function getProdutoML(link) {
  try {
    // 🔥 1. resolve encurtador meli.la
    const realLink = await resolverLink(link);

    // 🔥 2. pega ID do produto
    const id = extrairId(realLink);

    if (!id) return null;

    // 🔥 3. chama API oficial
    const res = await axios.get(`https://api.mercadolibre.com/items/${id}`);

    const p = res.data;

    return {
      nome: p.title,
      preco: p.price,
      imagem: p.pictures?.[0]?.url,
      link: p.permalink
    };

  } catch (err) {
    console.log("Erro ML:", err.message);
    return null;
  }
}
