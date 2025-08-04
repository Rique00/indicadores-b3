/**
 * Scraper para obter indicadores de Fundos Imobiliários do site Fundsexplorer.
 * Este módulo usa axios para fazer a requisição HTTP e cheerio para parsear o HTML.
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Normaliza uma string de valor, removendo caracteres indesejados e convertendo para float.
 * Trata valores com "M" (milhão) e "B" (bilhão).
 * @param {string} value A string com o valor a ser normalizado.
 * @returns {number|string} O valor numérico ou a string original caso não seja um número.
 */
function normalizeValue(value) {
  if (!value || value === '-') {
    return null;
  }

  // Remove R$, %, pontos de milhar e espaços.
  let cleanedValue = value.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.').replace('%', '').trim();
  
  // Trata valores com "M" (milhão) e "B" (bilhão).
  if (cleanedValue.includes('M')) {
    cleanedValue = parseFloat(cleanedValue.replace('M', '')) * 1_000_000;
  } else if (cleanedValue.includes('B')) {
    cleanedValue = parseFloat(cleanedValue.replace('B', '')) * 1_000_000_000;
  }

  const parsedValue = parseFloat(cleanedValue);
  return isNaN(parsedValue) ? value : parsedValue;
}

/**
 * Extrai o valor de um indicador específico de uma caixa na página do Fundsexplorer.
 * A função encontra a caixa pelo texto do indicador e extrai o valor.
 * @param {object} $ O objeto Cheerio com o DOM da página.
 * @param {string} title O título do indicador a ser buscado (ex: "P/VP", "Dividend Yield").
 * @returns {number|string|null} O valor do indicador ou null se não for encontrado.
 */
function getValueFromBox($, title) {
  // Encontra a caixa (div.indicators__box) que contém o texto do título.
  const box = $(`.indicators__box:contains(${title})`);
  // Se a caixa for encontrada, procura pelo elemento <b> que contém o valor.
  if (box.length) {
    const valueElement = box.find('p b');
    if (valueElement.length) {
      const value = valueElement.first().text().trim();
      return normalizeValue(value);
    }
  }
  // Se o indicador não for encontrado
  return null;
}

/**
 * Busca os indicadores de um Fundo Imobiliário na página do Fundsexplorer.
 * @param {string} ticker O código do FII (ex: "ALZR11").
 * @returns {Promise<object>} Um objeto com os indicadores do FII.
 */
async function getIndicadoresFII(ticker) {
  if (!ticker) {
    throw new Error('Ticker não fornecido.');
  }

  const url = `https://www.fundsexplorer.com.br/funds/${ticker.toLowerCase()}/`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

    // Extrai o preço atual, que tem uma estrutura diferente.
    const precoAtual = normalizeValue($('.item--quotation .item-value .value').text());

    return {
      ticker: ticker.toUpperCase(),
      preco_atual: precoAtual,
      liquidez_media_diaria: getValueFromBox($, 'Liquidez Média Diária'),
      ultimo_rendimento: getValueFromBox($, 'Último Rendimento'),
      dividend_yield: getValueFromBox($, 'Dividend Yield'),
      patrimonio_liquido: getValueFromBox($, 'Patrimônio Líquido'),
      valor_patrimonial: getValueFromBox($, 'Valor Patrimonial'),
      pvp: getValueFromBox($, 'P/VP'),
      rentabilidade_no_mes: getValueFromBox($, 'Rentab. no mês'),
    };

  } catch (error) {
    console.error(`Erro ao buscar dados para o ticker ${ticker}:`, error.message);
    throw new Error(`Falha ao buscar dados para o ticker ${ticker}. Verifique a URL e a conexão.`);
  }
}

module.exports = { getIndicadoresFII };