// fii.js

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Normaliza uma string de valor, removendo caracteres indesejados e convertendo para float.
 * @param {string} value A string com o valor a ser normalizado.
 * @returns {number|string} O valor numérico ou a string original caso não seja um número.
 */
function normalizeValue(value) {
  if (!value || value.trim() === '-' || value.trim() === 'N/A') {
    return null;
  }
  let cleanedValue = value.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.').replace('%', '').trim();
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
 * @param {object} $ O objeto Cheerio com o DOM da página.
 * @param {string} title O título do indicador a ser buscado.
 * @returns {number|string|null} O valor do indicador ou null se não for encontrado.
 */
function getValueFromBox($, title) {
  const box = $(`.indicators__box:contains(${title})`);
  if (box.length) {
    const valueElement = box.find('p b').first();
    if (valueElement.length) {
      return normalizeValue(valueElement.text());
    }
  }
  return null;
}

/**
 * Busca os indicadores de um Fundo Imobiliário na página do Fundsexplorer.
 * @param {string} ticker O código do FII (ex: "ALZR11").
 * @returns {Promise<object>} Um objeto com os indicadores do FII ou um erro.
 */
async function getIndicadoresFII(ticker) {
  try {
    const url = `https://www.fundsexplorer.com.br/funds/${ticker.toLowerCase()}/`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    
    // Verificação para garantir que o elemento da cotação existe, se não, é um erro.
    const precoElement = $('.item--quotation .item-value .value');
    if (!precoElement.length) {
      return { erro: `Não foi possível encontrar dados para o FII ${ticker}. O ticker pode não existir ou a estrutura do site mudou.` };
    }

    const precoAtual = normalizeValue(precoElement.text());

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
    return { erro: `Falha na requisição para o FII ${ticker}. Causa: ${error.message}` };
  }
}

module.exports = { getIndicadoresFII };
