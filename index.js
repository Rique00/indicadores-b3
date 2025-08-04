// index.js - Arquivo de entrada da sua API
const express = require('express');
const cors = require('cors');
const app = express();
const { getIndicadoresAcao } = require('./scrapers/acao');
const { getIndicadoresFII } = require('./scrapers/fii');

app.use(cors());

// Rota para Ações
app.get('/api/acao/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toLowerCase();
  const dados = await getIndicadoresAcao(ticker);
  
  if (dados.erro) {
    res.status(404).json(dados); // Retorna 404 e a mensagem de erro
  } else {
    res.json(dados); // Retorna os dados com sucesso
  }
});

// Rota para FIIs
app.get('/api/fii/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toLowerCase();
  const dados = await getIndicadoresFII(ticker);

  if (dados.erro) {
    res.status(404).json(dados); // Retorna 404 e a mensagem de erro
  } else {
    res.json(dados); // Retorna os dados com sucesso
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ativa na porta ${PORT}`));
