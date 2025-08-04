const axios = require('axios');
const cheerio = require('cheerio');

async function getIndicadoresFII(ticker) {
  const url = `https://www.fundsexplorer.com.br/funds/${ticker}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const getValue = (label) => {
    const el = $(`strong:contains("${label}")`).parent().next().find('strong');
    return el.text().trim() || '-';
  };

  return {
    ticker: ticker.toUpperCase(),
    preco_atual: getValue('Preço Atual'),
    dividend_yield: getValue('Dividend Yield'),
    p_vp: getValue('P/VP'),
    liquidez_diaria: getValue('Liquidez Diária'),
    vacancia_fisica: getValue('Vacância Física'),
    vacancia_financeira: getValue('Vacância Financeira'),
    qtd_imoveis: getValue('Quantidade de imóveis')
  };
}

module.exports = { getIndicadoresFII };