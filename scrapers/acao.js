// acao.js

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Normaliza um valor monetário ou percentual.
 * @param {string} value Valor em string para normalizar.
 * @returns {number|null} Valor numérico normalizado.
 */
function normalizeValue(value) {
    if (!value || value.trim() === '-' || value.trim() === 'N/A') {
        return null;
    }
    return parseFloat(value.replace(/\./g, '').replace(',', '.').replace('%', '').trim());
}

/**
 * Busca indicadores de uma Ação na página do Fundamentus.
 * @param {string} ticker O código da Ação (ex: "PETR4").
 * @returns {Promise<object>} Um objeto com os indicadores da Ação ou um erro.
 */
async function getIndicadoresAcao(ticker) {
    try {
        const url = `https://www.fundamentus.com.br/detalhes.php?papel=${ticker}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);

        // Verifica se a tabela principal de dados existe.
        const tabelaPrincipal = $('table.w70.pb0');
        if (tabelaPrincipal.length === 0) {
            return { erro: `Não foi possível encontrar dados para a ação ${ticker}. O ticker pode não existir ou a estrutura do site mudou.` };
        }

        const getIndicator = (label) => {
            const element = tabelaPrincipal.find(`td:contains("${label}")`).next('td');
            if (element.length) {
                return normalizeValue(element.text());
            }
            return null;
        };

        const getP_E = () => {
            const element = $('td:contains("P/L")').next('td');
            return element.length ? normalizeValue(element.text()) : null;
        };

        const getP_VP = () => {
            const element = $('td:contains("P/VP")').next('td');
            return element.length ? normalizeValue(element.text()) : null;
        };

        const getPrecoAtual = () => {
            const element = $('td.txt-large').first().text();
            return normalizeValue(element);
        };

        return {
            ticker: ticker.toUpperCase(),
            preco_atual: getPrecoAtual(),
            p_e: getP_E(),
            p_vp: getP_VP(),
            dividend_yield: getIndicator('Div. Yield'),
            valor_patrimonial: getIndicator('Valor de Mercado'),
            roe: getIndicator('ROE'),
        };

    } catch (error) {
        console.error(`Erro ao buscar dados para a ação ${ticker}:`, error.message);
        return { erro: `Falha na requisição para a ação ${ticker}. Causa: ${error.message}` };
    }
}

module.exports = { getIndicadoresAcao };
