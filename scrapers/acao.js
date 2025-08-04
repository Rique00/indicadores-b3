/**
 * Scraper para obter indicadores de ações do site Investidor10.
 * Este módulo usa axios para fazer a requisição HTTP e cheerio para parsear o HTML.
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Normaliza uma string de valor, removendo caracteres indesejados e convertendo para float.
 * @param {string} value A string com o valor a ser normalizado.
 * @returns {number|string} O valor numérico ou a string original caso não seja um número.
 */
function normalizeValue(value) {
  if (!value || value === '-') {
    return null;
  }
  // Remove R$, %, pontos de milhar e substitui a vírgula por ponto.
  const cleanedValue = value.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.').replace('%', '').trim();
  const parsedValue = parseFloat(cleanedValue);
  return isNaN(parsedValue) ? value : parsedValue;
}

/**
 * Extrai o valor de um indicador específico de um cartão na página do Investidor10.
 * A função encontra o cartão pelo título do indicador e extrai o valor.
 * @param {object} $ O objeto Cheerio com o DOM da página.
 * @param {string} title O título do indicador a ser buscado (ex: "P/L", "ROE").
 * @returns {number|string|null} O valor do indicador ou null se não for encontrado.
 */
function getValueFromCard($, title) {
  // Encontra o span com o título desejado dentro do _card-header
  const headerSpan = $(`._card-header span[title="${title}"]`);
  // Se o header for encontrado, encontra o cartão pai (div._card)
  if (headerSpan.length) {
    const card = headerSpan.closest('._card');
    // Dentro do cartão, encontra o _card-body e extrai o texto do primeiro span
    const value = card.find('._card-body span').first().text().trim();
    return normalizeValue(value);
  }
  // Se o indicador não for encontrado
  return null;
}

/**
 * Busca os indicadores de uma Ação na página do Investidor10.
 * @param {string} ticker O código da Ação (ex: "BBAS3").
 * @returns {Promise<object>} Um objeto com os indicadores da ação.
 */
async function getIndicadoresFII(ticker) {
  try { // Bloco try...catch adicionado para evitar que a aplicação trave
    if (!ticker) {
      throw new Error('Ticker não fornecido.');
    }

    const url = `https://www.fundsexplorer.com.br/funds/${ticker.toLowerCase()}/`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

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
    // Retorna um erro amigável em vez de travar o servidor
    throw new Error(`Falha ao buscar dados para o ticker ${ticker}. Verifique a URL ou o seletor. Causa: ${error.message}`);
  }
}

module.exports = { getIndicadoresAcao };
