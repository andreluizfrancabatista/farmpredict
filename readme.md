# FarmPredict

Aplicação web para análise e predição de dados de colheita de cana-de-açúcar.

## Tecnologias Utilizadas

- **Frontend**: React.js
- **Backend**: Node.js com Express
- **Fonte de Dados**: CSV via GitHub (futuro: API REST)

## Funcionalidades

- Visualização de dados de colheita por horário
- Cálculo automático de métricas de produtividade:
  - Toneladas por hora (ton/hr)
  - Toneladas por hora efetiva (ton/hr efetiva)
- Interface responsiva com tabela de dados
- Seleção de horário para carregamento de dados específicos

## Estrutura de Dados

### Dados de Entrada (CSV)
- ID da frente (equipe)
- ID da colhedora
- Status da colhedora
- Toneladas por dia (ton/dia)
- Tempo produtivo (hh:mm)

### Dados Calculados
- **Toneladas por hora**: toneladas por dia ÷ horário atual
- **Toneladas por hora efetiva**: toneladas por dia ÷ tempo produtivo

## Instalação e Execução

### Prerequisites
- Node.js (versão 14 ou superior)
- npm ou yarn

### Backend
```bash
cd backend
npm install
npm start
```
O servidor será executado na porta 5000.

### Frontend
```bash
cd frontend
npm install
npm start
```
A aplicação será executada na porta 3000.

## Estrutura do Projeto

```
farmpredict/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── backend/
│   ├── server.js
│   ├── routes/
│   └── package.json
└── README.md
```

## URL dos Dados

Os dados são carregados a partir de:
`https://github.com/andreluizfrancabatista/farmpredict/blob/main/data/painel-{hora}.csv`

Onde `{hora}` segue o formato: `11h00`, `14h00`, etc.

## Desenvolvimento Futuro

- Migração de CSV para API REST
- Funcionalidades de predição (coluna direita)
- Dashboard com gráficos e métricas avançadas