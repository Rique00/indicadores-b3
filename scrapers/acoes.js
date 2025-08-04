const axios = require('axios');
const cheerio = require('cheerio');

async function getIndicadoresAcao(ticker) {
  const url = `https://investidor10.com.br/acoes/${ticker}/`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const getIndicador = (label) => {
    const el = $(`.top-info span:contains("${label}")`).next();
    return el.text().trim() || '-';
  };

  return {
    ticker: ticker.toUpperCase(),
    pl: getIndicador('P/L'),
    dy: getIndicador('Dividend Yield'),
    pvp: getIndicador('P/VP'),
    roe: getIndicador('ROE'),
    div_liq_ebitda: getIndicador('Dív. Líquida / EBITDA'),
    cagr_lucros: getIndicador('CAGR Lucros 5 anos'),
    div_patrimonio: getIndicador('Dív. Bruta / Patrimônio'),
    liquidez_corrente: getIndicador('Liquidez Corrente'),
    cres_rec_5a: getIndicador('Cresc. Receita 5 anos'),
    cres_lucro_5a: getIndicador('Cresc. Lucro 5 anos')
  };
}

module.exports = { getIndicadoresAcao };