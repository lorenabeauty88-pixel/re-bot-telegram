async function buscarPorLinkML(link) {
  try {
    // 🔥 pega qualquer padrão MLB (mais robusto)
    const match = link.match(/MLB-\d+|MLB\d+/i);

    if (!match) {
      return null;
    }

    const id = match[0].replace("-", "");

    const url = `https://api.mercadolibre.com/items/${id}`;
    const res = await axios.get(url);

    const item = res.data;

    const precoAtual = item.price;
    const precoOriginal = item.original_price || item.price;

    let desconto = 0;
    if (precoOriginal > precoAtual) {
      desconto = Math.round(((precoOriginal - precoAtual) / precoOriginal) * 100);
    }

    return {
      nome: item.title,
      preco: precoAtual,
      precoOriginal: precoOriginal,
      desconto: desconto,
      link: item.permalink,
      imagem: item.thumbnail
    };

  } catch (err) {
    console.log("ERRO LINK ML:", err.message);
    return null;
  }
}
