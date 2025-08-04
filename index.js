// index.js - Arquivo de entrada da sua API
const express = require('express');
const cors = require('cors');
const app = express();
// Importação CORRIGIDA para os novos nomes de arquivos
const { getIndicadoresAcao } = require('./scrapers/acao'); 
const { getIndicadoresFII } = require('./scrapers/fii');   

app.use(cors());

// Rota para Ações
app.get('/api/acao/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toLowerCase();
  try {
    const dados = await getIndicadoresAcao(ticker);
    res.json(dados);
  } catch (e) {
    console.error(`Erro ao obter dados da ação ${ticker}:`, e);
    res.status(500).json({ erro: 'Erro ao obter dados da ação.' });
  }
});

// Rota para FIIs
app.get('/api/fii/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toLowerCase();
  try {
    const dados = await getIndicadoresFII(ticker);
    res.json(dados);
  } catch (e) {
    console.error(`Erro ao obter dados do FII ${ticker}:`, e);
    res.status(500).json({ erro: 'Erro ao obter dados do FII.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ativa na porta ${PORT}`));
