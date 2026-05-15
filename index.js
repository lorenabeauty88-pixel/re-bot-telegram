const axios = require("axios");

// 🔥 resolve qualquer link (meli.la / ML / afiliado)
async function resolverLink(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 10,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    return res.request.res.responseUrl || url;
  } catch (e) {
    console.log("Erro resolver:", e.message);
    return url;
  }
}

// 🚀 pega dados sem depender de MLB
async function pegarProduto(link) {
  try {
    const realLink = await resolverLink(link);

    // API alternativa mais estável: busca por URL
    const res = await axios.get(
      `https://api.mercadolibre.com/products/search?site_id=MLB&q=${encodeURIComponent(realLink)}`
    );

    const item = res.data.results?.[0];

    if (!item) return null;

    return {
      nome: item.title,
      preco: item.price?.amount || item.price,
      imagem: item.thumbnail,
      link: realLink
    };

  } catch (err) {
    console.log("Erro produto:", err.message);
    return null;
  }
}
