const express = require('express');
const cors = require('cors');
const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Função para converter tempo produtivo (hh:mm) em horas decimais
function convertTimeToHours(timeString) {
  if (!timeString || timeString === '') return 0;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + (minutes / 60);
}

// Função para calcular métricas
function calculateMetrics(data, currentHour) {
  // 🔍 LOG PARA DEBUG - mostra as colunas disponíveis no CSV
  if (data.length > 0) {
    console.log('📊 Colunas disponíveis no CSV:', Object.keys(data[0]));
    console.log('📄 Primeira linha de dados:', data[0]);
  }

  return data.map(row => {
    // 🎯 MAPEAMENTO CORRETO PARA AS COLUNAS DO CSV
    const tonPerDay = parseFloat(
      row['Toneladas por dia (acumulada)'] || 0
    );
    
    const productiveTime = convertTimeToHours(
      row['Tempo produtivo (acumulado)'] || '0:00'
    );
    
    // Toneladas por hora = toneladas por dia / hora atual
    const tonPerHour = currentHour > 0 ? tonPerDay / currentHour : 0;
    
    // Toneladas por hora efetiva = toneladas por dia / tempo produtivo
    const tonPerHourEffective = productiveTime > 0 ? tonPerDay / productiveTime : 0;
    
    return {
      equipamento: row['Código Equipamento'] || 'N/A',
      frente: row['Descrição do Grupo de Equipamento'] || 'N/A',
      status: row['Descrição do Grupo da Operação'] || 'N/A',
      tonDia: tonPerDay.toFixed(2),
      tonHora: tonPerHour.toFixed(4),
      tempoProdutivo: row['Tempo produtivo (acumulado)'] || '00:00',
      tonHoraEfetiva: tonPerHourEffective.toFixed(4)
    };
  });
}

// Rota para carregar dados do CSV
app.get('/api/data/:hour', async (req, res) => {
  try {
    const { hour } = req.params;
    
    // Converter hora para formato do arquivo (ex: 11:00 -> 11h00)
    const formattedHour = hour.replace(':', 'h');
    
    // 🔗 CONFIGURAÇÃO DO LINK CSV - MODIFIQUE AQUI SE NECESSÁRIO
    const csvUrl = `https://raw.githubusercontent.com/andreluizfrancabatista/farmpredict/main/data/painel-${formattedHour}.csv`;
    
    console.log(`Tentando carregar: ${csvUrl}`);
    
    // Fazer download do CSV
    const response = await axios.get(csvUrl, {
      responseType: 'stream',
      timeout: 10000
    });
    
    const results = [];
    
    // Parse do CSV
    await new Promise((resolve, reject) => {
      response.data
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhum dado encontrado no arquivo CSV',
        url: csvUrl 
      });
    }
    
    // Extrair hora atual do parâmetro para cálculos
    const currentHour = parseFloat(hour.split(':')[0]) + (parseFloat(hour.split(':')[1]) / 60);
    
    // Calcular métricas
    const processedData = calculateMetrics(results, currentHour);
    
    res.json({
      success: true,
      data: processedData,
      totalRecords: processedData.length,
      hour: hour,
      source: csvUrl
    });
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ 
        error: 'Arquivo CSV não encontrado para o horário especificado',
        hour: req.params.hour 
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({ 
        error: 'Timeout ao carregar dados. Tente novamente.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Erro interno do servidor ao processar dados',
        details: error.message 
      });
    }
  }
});

// Rota de status da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'API FarmPredict funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota para listar horários disponíveis
app.get('/api/available-hours', (req, res) => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, '0')}:00`);
  }
  
  res.json({
    success: true,
    hours: hours
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor FarmPredict executando na porta ${port}`);
  console.log(`📊 API disponível em: http://localhost:${port}/api`);
});