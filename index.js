async function pegarProduto(link) {
  try {
    const realLink = await resolverLink(link);
    const loja = detectarLoja(realLink);

    let titulo = "🔥 Produto";
    let imagem = fallbackImagem(loja);
    let preco = 49.9;

    // =========================
    // 🟡 MERCADO LIVRE (mantido scraping)
    // =========================
    if (loja === "🟡 Mercado Livre") {
      const res = await axios.get(realLink, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "pt-BR"
        }
      });

      const html = res.data;
      const $ = cheerio.load(html);

      titulo =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text();

      imagem =
        $('meta[property="og:image"]').attr("content") ||
        fallbackImagem(loja);

      const match = html.match(/"price":\s?([0-9.]+)/);
      if (match) preco = parseFloat(match[1]);

      return { titulo, imagem, preco, link: realLink, loja };
    }

    // =========================
    // 🟣 SHOPEE (SAFE MODE)
    // =========================
    if (loja === "🟣 Shopee") {
      return {
        titulo: "🔥 Produto Shopee",
        imagem: fallbackImagem(loja),
        preco: 49.9,
        link: realLink,
        loja
      };
    }

    // =========================
    // 🟠 AMAZON (SAFE MODE)
    // =========================
    if (loja === "🟠 Amazon") {
      return {
        titulo: "🔥 Produto Amazon",
        imagem: fallbackImagem(loja),
        preco: 49.9,
        link: realLink,
        loja
      };
    }

    return null;

  } catch (err) {
    console.log("❌ ERRO:", err.message);
    return null;
  }
}
