async function pegarProduto(link) {
  try {
    const realLink = await resolverLink(link);
    const loja = detectarLoja(realLink);

    const res = await axios.get(realLink, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "pt-BR,pt;q=0.9"
      }
    });

    const html = res.data;

    if (!html || html.includes("not viewable")) {
      throw new Error("Conteúdo bloqueado pelo site");
    }

    const $ = cheerio.load(html);

    let titulo = $("title").text() || "Produto";
    let imagem = $('meta[property="og:image"]').attr("content");
    let preco = html.match(/"price":\s?([0-9.]+)/);

    if (preco) preco = parseFloat(preco[1]);
    else preco = 49.9;

    if (!imagem) {
      imagem = fallbackImagem(loja);
    }

    // =========================
    // 🟡 MERCADO LIVRE NÃO MEXIDO
    // =========================
    if (loja === "🟡 Mercado Livre") {
      const mlTitulo =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text();

      const mlImagem =
        $('meta[property="og:image"]').attr("content");

      const mlPreco = html.match(/"price":\s?([0-9.]+)/);

      return {
        titulo: mlTitulo,
        imagem: mlImagem,
        preco: mlPreco ? parseFloat(mlPreco[1]) : 49.9,
        link: realLink,
        loja
      };
    }

    return {
      titulo,
      imagem,
      preco,
      link: realLink,
      loja
    };

  } catch (err) {
    console.log("❌ ERRO COMPLETO:", err.message);
    return null;
  }
}
