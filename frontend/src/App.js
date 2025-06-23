import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Componente para seleção de horário
const TimeSelector = ({ selectedHour, onHourChange, onLoadData, loading }) => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, '0')}:00`);
  }

  return (
    <div className="time-selector">
      <select 
        value={selectedHour} 
        onChange={(e) => onHourChange(e.target.value)}
        className="hour-select"
      >
        <option value="">Selecione um horário</option>
        {hours.map(hour => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <button 
        onClick={onLoadData} 
        disabled={!selectedHour || loading}
        className="load-button"
      >
        {loading ? 'Carregando...' : 'Carregar'}
      </button>
    </div>
  );
};

// Componente da Inteligência do Negócio
const BusinessIntelligence = ({ data, dataHour }) => {
  const [metaToneladas, setMetaToneladas] = useState('');
  const [resultado, setResultado] = useState(null);

  // Calcula soma total de ton/hora das estimativas
  const calcularSomaTonHora = () => {
    if (!data || data.length === 0) return 0;
    
    const estimates = data.map(row => {
      const tempoProdutivoMinutos = timeToMinutes(row.tempoProdutivo);
      const horaAtual = dataHour ? parseInt(dataHour.split(':')[0]) : 0;
      const totalMinutosAteAgora = horaAtual * 60;
      
      const porcentagemProdutiva = totalMinutosAteAgora > 0 ? 
        (tempoProdutivoMinutos / totalMinutosAteAgora) * 100 : 0;
      
      const tonHoraEfetiva = parseFloat(row.tonHoraEfetiva);
      const tonHoraProjecao = (porcentagemProdutiva / 100) * tonHoraEfetiva;
      
      return tonHoraProjecao;
    });
    
    return estimates.reduce((sum, ton) => sum + ton, 0);
  };

  // Função auxiliar para converter tempo
  const timeToMinutes = (timeString) => {
    if (!timeString || timeString === '00:00:00') return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + (seconds / 60);
  };

  // Função para formatar tempo em horas e minutos
  const formatarTempo = (horas) => {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    
    if (horasInteiras === 0) {
      return `${minutos} minutos`;
    } else if (minutos === 0) {
      return `${horasInteiras} ${horasInteiras === 1 ? 'hora' : 'horas'}`;
    } else {
      return `${horasInteiras}h ${minutos}min`;
    }
  };

  // Função para calcular horários
  const calcularHorarios = (minutosAdicionais) => {
    const horaAtualNum = dataHour ? parseInt(dataHour.split(':')[0]) : 0;
    const horaAtual = `${horaAtualNum.toString().padStart(2, '0')}:00`;
    
    const totalMinutos = (horaAtualNum * 60) + 60 + minutosAdicionais; // hora atual + 60 min + tempo adicional
    const horaFinal = Math.floor(totalMinutos / 60) % 24;
    const minutosFinal = totalMinutos % 60;
    const horaPrevista = `${horaFinal.toString().padStart(2, '0')}:${minutosFinal.toString().padStart(2, '0')}`;
    
    return { horaAtual, horaPrevista };
  };

  const calcularMeta = () => {
    const meta = parseFloat(metaToneladas);
    if (isNaN(meta) || meta <= 0) {
      setResultado({
        tipo: 'erro',
        mensagem: 'Por favor, insira uma meta válida maior que zero.'
      });
      return;
    }

    const somaTonHora = calcularSomaTonHora();
    
    if (somaTonHora === 0) {
      setResultado({
        tipo: 'erro',
        mensagem: 'Nenhum dado de produtividade disponível para cálculo.'
      });
      return;
    }

    if (meta <= somaTonHora) {
      setResultado({
        tipo: 'sucesso',
        mensagem: `🎉 Meta já alcançada! A produção atual de ${somaTonHora.toFixed(2)} ton/h já supera sua meta de ${meta} toneladas.`,
        detalhes: `Excesso de ${(somaTonHora - meta).toFixed(2)} toneladas por hora.`,
        insight: `💡 Para otimizar em 60 min: Você pode reduzir a meta para ${(somaTonHora * 1).toFixed(2)} ton/h ou manter a produção atual.`
      });
    } else {
      const toneladas_restantes = meta - somaTonHora;
      const tempo_necessario_horas = toneladas_restantes / somaTonHora;
      const tempo_adicional_minutos = Math.round(tempo_necessario_horas * 60);
      const tempo_total_minutos = 60 + tempo_adicional_minutos;
      
      // Calcular horários
      const horarios = calcularHorarios(tempo_adicional_minutos);
      
      // Calcular taxa necessária para atingir meta em 60 minutos
      const taxa_necessaria_60min = meta / 1; // meta dividida por 1 hora (60 min)
      const aumento_necessario = ((taxa_necessaria_60min - somaTonHora) / somaTonHora * 100);
      
      setResultado({
        tipo: 'calculo',
        mensagem: `⏱️ Para atingir sua meta de ${meta} toneladas`,
        tempoAdicional: `${tempo_adicional_minutos} minutos adicionais`,
        tempoTotal: `${tempo_total_minutos} minutos`,
        horaAtual: horarios.horaAtual,
        horaPrevista: horarios.horaPrevista,
        detalhes: `Produção atual: ${somaTonHora.toFixed(2)} ton/h | Faltam: ${toneladas_restantes.toFixed(2)} toneladas`,
        projecao: `Com a taxa atual, você precisará de aproximadamente ${formatarTempo(tempo_necessario_horas)} adicionais.`,
        insight: `💡 Para alcançar a meta em 60 min: Aumente a taxa atual em ${aumento_necessario.toFixed(1)}% (de ${somaTonHora.toFixed(2)} para ${taxa_necessaria_60min.toFixed(2)} ton/h)`
      });
    }
  };

  const limparCalculo = () => {
    setMetaToneladas('');
    setResultado(null);
  };

  if (!data || data.length === 0) {
    return (
      <div className="business-intelligence">
        <h3>🧠 Inteligência do Negócio</h3>
        <div className="bi-placeholder">
          <p>Carregue os dados para acessar a inteligência do negócio</p>
        </div>
      </div>
    );
  }

  const somaTonHora = calcularSomaTonHora();

  return (
    <div className="business-intelligence">
      <h3>🧠 Inteligência do Negócio</h3>
      
      <div className="bi-widget">
        <div className="widget-header">
          <h4>📊 Projeção de Metas</h4>
          <p>Taxa atual: <strong>{somaTonHora.toFixed(2)} ton/h</strong></p>
        </div>
        
        <div className="meta-input-section">
          <label htmlFor="meta-input">Meta de Produção (toneladas):</label>
          <div className="input-group">
            <input
              id="meta-input"
              type="number"
              value={metaToneladas}
              onChange={(e) => setMetaToneladas(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && calcularMeta()}
              placeholder="Ex: 50"
              className="meta-input"
              min="0"
              step="1"
              max="999"
            />
            <button onClick={calcularMeta} className="calc-button">
              Calcular
            </button>
            {resultado && (
              <button onClick={limparCalculo} className="clear-button">
                Limpar
              </button>
            )}
          </div>
        </div>

        {resultado && (
          <div className={`resultado ${resultado.tipo}`}>
            <div className="resultado-header">
              <strong>{resultado.mensagem}</strong>
            </div>
            
            {resultado.tipo === 'sucesso' && (
              <div className="resultado-detalhes sucesso-detalhes">
                <p className="excesso-texto">{resultado.detalhes}</p>
                <p className="insight-texto">{resultado.insight}</p>
              </div>
            )}
            
            {resultado.tipo === 'calculo' && (
              <div className="resultado-detalhes calculo-detalhes">
                <div className="tempo-container">
                  <div className="tempo-destaque">
                    <div className="tempo-linha">
                      <span className="tempo-label">Tempo adicional necessário:</span>
                      <span className="tempo-valor">{resultado.tempoAdicional}</span>
                    </div>
                    <div className="tempo-linha tempo-total">
                      <span className="tempo-label">Tempo total necessário:</span>
                      <span className="tempo-valor">{resultado.tempoTotal}</span>
                    </div>
                  </div>
                  
                  <div className="horarios-destaque">
                    <div className="horario-linha">
                      <span className="horario-label">Hora atual:</span>
                      <span className="horario-valor">{resultado.horaAtual}</span>
                    </div>
                    <div className="horario-linha">
                      <span className="horario-label">Hora prevista para meta:</span>
                      <span className="horario-valor">{resultado.horaPrevista}</span>
                    </div>
                  </div>

                  <div className="detalhes-destaque">
                    <div className="detalhe-linha">
                      <span className="detalhe-label">Produção atual:</span>
                      <span className="detalhe-valor">{resultado.detalhes.split(' | ')[0].replace('Produção atual: ', '')}</span>
                    </div>
                    <div className="detalhe-linha">
                      <span className="detalhe-label">Faltam:</span>
                      <span className="detalhe-valor">{resultado.detalhes.split(' | ')[1].replace('Faltam: ', '')}</span>
                    </div>
                  </div>
                </div>
                
                <p className="insight-texto">{resultado.insight}</p>
              </div>
            )}
            
            {resultado.tipo === 'erro' && (
              <div className="resultado-detalhes erro-detalhes">
                <p>{resultado.mensagem}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente da tabela de estimativas
const EstimateTable = ({ data, dataHour, loading }) => {
  // 🚫 SÓ MOSTRA ESTIMATIVAS SE HOUVER DADOS CARREGADOS
  if (loading) {
    return (
      <div className="estimate-placeholder">
        <h3>Estimativas (Próximos 60min)</h3>
        <div className="loading">Carregando estimativas...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="estimate-placeholder">
        <h3>Estimativas (Próximos 60min)</h3>
        <p>Clique em "Carregar" para visualizar as estimativas</p>
      </div>
    );
  }

  // Função para converter tempo hh:mm:ss para minutos
  const timeToMinutes = (timeString) => {
    if (!timeString || timeString === '00:00:00') return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + (seconds / 60);
  };

  // Função para converter minutos para formato mm:ss (sem horas)
  const minutesToTimeShort = (totalMinutes) => {
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.floor((totalMinutes % 1) * 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calcular estimativas para cada equipamento
  const estimates = data.map(row => {
    const tempoProdutivoMinutos = timeToMinutes(row.tempoProdutivo);
    // 🔧 USA O HORÁRIO DOS DADOS CARREGADOS (dataHour), NÃO O DROPDOWN
    const horaAtual = dataHour ? parseInt(dataHour.split(':')[0]) : 0;
    const totalMinutosAteAgora = horaAtual * 60;
    
    // Calcula porcentagem de tempo produtivo
    const porcentagemProdutiva = totalMinutosAteAgora > 0 ? 
      (tempoProdutivoMinutos / totalMinutosAteAgora) * 100 : 0;
    
    // Tempo produtivo nos próximos 60 minutos
    const tempoEfetivoProximaHora = (porcentagemProdutiva / 100) * 60;
    const tempoImprodutivoProximaHora = 60 - tempoEfetivoProximaHora;
    
    // Toneladas por hora baseada na eficiência
    const tonHoraEfetiva = parseFloat(row.tonHoraEfetiva);
    const tonHoraProjecao = (porcentagemProdutiva / 100) * tonHoraEfetiva;

    return {
      equipamento: row.equipamento,
      tempoEfetivo: tempoEfetivoProximaHora,
      tempoEfetivoFormatado: minutesToTimeShort(tempoEfetivoProximaHora),
      porcentagemProdutiva: porcentagemProdutiva,
      tempoImprodutivo: tempoImprodutivoProximaHora,
      tempoImprodutivoFormatado: minutesToTimeShort(tempoImprodutivoProximaHora),
      porcentagemImprodutiva: 100 - porcentagemProdutiva,
      velocidade: '', // Vazio por enquanto
      tonHora: tonHoraProjecao,
      tonMinuto: '' // Vazio por enquanto
    };
  });

  // Calcular totais/médias para a última linha
  const somaVelocidade = 0; // Média será 0 pois não há dados
  const somaTonHora = estimates.reduce((sum, est) => sum + est.tonHora, 0);
  const somaTonMinuto = 0; // Soma será 0 pois não há dados

  return (
    <div className="estimate-container">
      <h3>Estimativas (Próximos 60min)</h3>
      <table className="estimate-table">
        <thead>
          <tr>
            <th>Equipamento</th>
            <th>Tempo Efetivo (%)</th>
            <th>Improdutivo (%)</th>
            <th>Velocidade</th>
            <th>Ton/Hora</th>
            <th>Ton/Minuto</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((est, index) => (
            <tr key={index}>
              <td>{est.equipamento}</td>
              <td>
                {est.tempoEfetivoFormatado} ({est.porcentagemProdutiva.toFixed(0)}%)
              </td>
              <td>
                {est.tempoImprodutivoFormatado} ({est.porcentagemImprodutiva.toFixed(0)}%)
              </td>
              <td>{est.velocidade}</td>
              <td>{est.tonHora.toFixed(4)}</td>
              <td>{est.tonMinuto}</td>
            </tr>
          ))}
          <tr className="totals-row">
            <td><strong>TOTAL</strong></td>
            <td>-</td>
            <td>-</td>
            <td><strong>{somaVelocidade || '-'}</strong></td>
            <td><strong>{somaTonHora.toFixed(4)}</strong></td>
            <td><strong>{somaTonMinuto || '-'}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
const DataTable = ({ data, loading, error }) => {
  if (loading) {
    return <div className="loading">Carregando dados...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="no-data">Nenhum dado disponível. Selecione um horário e clique em "Carregar".</div>;
  }

  return (
    <div className="table-container">
      <h3>Dados de Colheita</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Equipamento</th>
            <th>Ton/Dia</th>
            <th>Ton/Hora</th>
            <th>Tempo Produtivo</th>
            <th>Ton/Hora Efetiva</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.equipamento}</td>
              <td>{row.tonDia}</td>
              <td>{row.tonHora}</td>
              <td>{row.tempoProdutivo}</td>
              <td>{row.tonHoraEfetiva}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-info">
        Total de registros: {data.length}
      </div>
    </div>
  );
};

// Componente principal
function App() {
  const [selectedHour, setSelectedHour] = useState('');
  const [data, setData] = useState([]);
  const [dataHour, setDataHour] = useState(''); // NOVO: Armazena o horário dos dados carregados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoadData = async () => {
    if (!selectedHour) {
      setError('Por favor, selecione um horário');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`/api/data/${selectedHour}`, {
        timeout: 15000
      });

      if (response.data.success) {
        setData(response.data.data);
        setDataHour(selectedHour); // SALVA O HORÁRIO DOS DADOS CARREGADOS
        setError('');
      } else {
        setError('Erro ao carregar dados');
        setData([]);
        setDataHour('');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      
      if (err.response?.status === 404) {
        setError(`Dados não encontrados para o horário ${selectedHour}`);
      } else if (err.code === 'ECONNABORTED') {
        setError('Timeout ao carregar dados. Verifique sua conexão.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro de conexão com o servidor');
      }
      
      setData([]);
      setDataHour(''); // LIMPA O HORÁRIO DOS DADOS TAMBÉM
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>FarmPredict</h1>
      </header>

      <main className="app-main">
        <div className="controls-section">
          <TimeSelector
            selectedHour={selectedHour}
            onHourChange={setSelectedHour}
            onLoadData={handleLoadData}
            loading={loading}
          />
        </div>

        <div className="content-section">
          <div className="left-column">
            <DataTable 
              data={data} 
              loading={loading} 
              error={error} 
            />
          </div>
          
          <div className="right-column">
            <EstimateTable 
              data={data} 
              dataHour={dataHour}
              loading={loading}
            />
            
            <BusinessIntelligence 
              data={data}
              dataHour={dataHour}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;