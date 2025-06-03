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

// Componente da tabela de dados
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
        setError('');
      } else {
        setError('Erro ao carregar dados');
        setData([]);
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
            <div className="placeholder">
              <h3>Área Reservada</h3>
              <p>Espaço reservado para funcionalidades futuras</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;