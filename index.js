async function pegarProduto(link) {

  try {

    const realLink = await resolverLink(link);

    const response = await axios.get(realLink, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9",
        "Referer": "https://google.com"
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 🏪 loja
    let loja = "🛒 Loja Online";

    if (realLink.includes("mercadolivre") || realLink.includes("meli.la")) {
      loja = "🟡 Mercado Livre";
    } else if (realLink.includes("amazon")) {
      loja = "🟠 Amazon";
    } else if (realLink.includes("shopee")) {
      loja = "🟣 Shopee";
    }

    // 📦 título
    let titulo =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      "🔥 Oferta Imperdível";

    // 🖼 imagem
    let imagem =
      $('meta[property="og:image"]').attr("content");

    // 💰 preço
    let preco =
      $('meta[property="product:price:amount"]').attr("content");

    if (!preco) {
      const match = html.match(/"price":\s?([0-9.]+)/);
      if (match) preco = match[1];
    }

    // 🟡 fallback Mercado Livre mais forte
    if (realLink.includes("mercadolivre") || realLink.includes("meli.la")) {

      const tituloML = html.match(/"name":"(.*?)"/);
      const precoML = html.match(/"price":\s?([0-9.]+)/);
      const imagemML = html.match(/"image":"(.*?)"/);

      if (tituloML) titulo = tituloML[1];
      if (precoML) preco = precoML[1];
      if (imagemML) imagem = imagemML[1].replace(/\\u002F/g, "/");
    }

    // 🟣 fallback Shopee simples
    if (realLink.includes("shopee")) {

      const tituloS = html.match(/"name":"(.*?)"/);
      const imagemS = html.match(/"image":"(.*?)"/);
      const precoS = html.match(/"price":"(.*?)"/);

      if (tituloS) titulo = tituloS[1];
      if (imagemS) imagem = imagemS[1].replace(/\\u002F/g, "/");
      if (precoS) preco = precoS[1];
    }

    if (!preco) preco = "49.90";

    return {
      titulo,
      preco,
      imagem,
      link: realLink,
      loja
    };

  } catch (err) {
    console.log("Erro produto:", err.message);
    return null;
  }
}
