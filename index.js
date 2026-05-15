const axios = require("axios");

// 🔥 resolve link encurtado de verdade
async function resolverLink(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 10,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    return res.request.res.responseUrl || url;
  } catch {
    return url;
  }
}

// 🔍 extrai MLB do HTML final (FUNCIONA MESMO COM LINK CURTO)
function extrairMLB(url) {
  const match = url.match(/MLB\d+/i);
  return match ? match[0] : null;
}

// 🚀 função REAL que funciona
async function pegarProdutoML(link) {
  try {
    const realLink = await resolverLink(link);

    // tenta pegar HTML da página final
    const res = await axios.get(realLink, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = res.data;

    const id = extrairMLB(html + realLink);

    if (!id) {
      console.log("❌ Não achou MLB no conteúdo");
      return null;
    }

    const api = await axios.get(
      `https://api.mercadolibre.com/items/${id}`
    );

    const p = api.data;

    return {
      nome: p.title,
      preco: p.price,
      imagem: p.pictures?.[0]?.url,
      link: p.permalink
    };

  } catch (err) {
    console.log("Erro final:", err.message);
    return null;
  }
}
