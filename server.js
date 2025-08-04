const express = require('express');
const cors = require('cors');
const app = express();
const { getIndicadoresAcao } = require('./scrapers/acoes');
const { getIndicadoresFII } = require('./scrapers/fiis');

app.use(cors());

app.get('/api/acao/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toLowerCase();
  try {
    const dados = await getIndicadoresAcao(ticker);
    res.json(dados);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao obter dados da ação.' });
  }
});

app.get('/api/fii/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toLowerCase();
  try {
    const dados = await getIndicadoresFII(ticker);
    res.json(dados);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao obter dados do FII.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ativa na porta ${PORT}`));