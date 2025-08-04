// index.js - Arquivo de entrada da sua API
const express = require('express');
const cors = require('cors');
const app = express();
const { getIndicadoresAcao } = require('./scrapers/acoes'); // Certifique-se de que o caminho do arquivo está correto
const { getIndicadoresFII } = require('./scrapers/fiis');   // Certifique-se de que o caminho do arquivo está correto

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
