async function fetchML(url) {
  const axios = require("axios");

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json,text/plain,*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Referer": "https://www.mercadolivre.com.br/",
    "Origin": "https://www.mercadolivre.com.br",
    "Connection": "keep-alive"
  };

  for (let i = 0; i < 4; i++) {
    try {
      const res = await axios.get(url, {
        headers,
        timeout: 20000
      });

      return res;

    } catch (err) {
      const status = err.response?.status;

      console.log(`⚠️ tentativa ${i + 1} falhou:`, status || err.message);

      // se for 403, espera um pouco antes de tentar de novo
      await new Promise(r => setTimeout(r, 1500 + i * 1000));

      if (i === 3) throw err;
    }
  }
}
