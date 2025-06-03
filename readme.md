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
- Descrição do Grupo de Equipamento (frente/equipe)
- Código Equipamento (ID da colhedora)
- Descrição do Grupo da Operação (status)
- Toneladas por dia (acumulada)
- Tempo produtivo (acumulado) no formato hh:mm

### Dados Calculados
- **Toneladas por hora**: toneladas por dia ÷ horário atual
- **Toneladas por hora efetiva**: toneladas por dia ÷ tempo produtivo

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### 🚀 Opção 1: Execução Simplificada (Recomendado)
```bash
# 1. Clone/baixe o projeto e entre na pasta
cd farmpredict

# 2. Instale todas as dependências de uma vez
npm run install-all

# 3. Execute frontend e backend juntos
npm run dev
```
✅ **Um comando só roda tudo!** Frontend (porta 3000) + Backend (porta 5000)

### 🔧 Opção 2: Scripts Separados
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 📋 Opção 3: Execução Manual
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### Scripts Disponíveis
- `npm run dev` - Executa frontend e backend simultaneamente
- `npm run server` - Executa apenas o backend
- `npm run client` - Executa apenas o frontend
- `npm run install-all` - Instala dependências de todos os projetos
- `npm run build` - Gera build de produção do frontend

## Estrutura do Projeto

```
farmpredict/
├── package.json          # Scripts principais e dependências compartilhadas
├── README.md
├── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   └── package.json      # Dependências do frontend
├── backend/
│   ├── server.js
│   ├── routes/
│   └── package.json      # Dependências do backend
└── data/                 # Arquivos CSV (no GitHub)
    ├── painel-00h00.csv
    ├── painel-01h00.csv
    └── ...
```

## URL dos Dados

Os dados são carregados a partir do GitHub:
```
https://raw.githubusercontent.com/andreluizfrancabatista/farmpredict/refs/heads/main/data/painel-{hora}.csv
```

**Formato dos arquivos:** `painel-11h00.csv`, `painel-14h00.csv`, etc.

### Estrutura Esperada do CSV
```csv
Descrição do Grupo de Equipamento,Código Equipamento,Data,Hora,Descrição do Grupo da Operação,Toneladas por dia (acumulada),Toneladas por hora,Tempo produtivo (acumulado),Toneladas por hora efetiva
Frente 1,COL001,2024-01-01,11:00,Operação A,150.5,13.68,08:30,17.71
Frente 2,COL002,2024-01-01,11:00,Operação B,200.0,18.18,09:15,21.62
```

## Desenvolvimento Futuro

- Migração de CSV para API REST
- Funcionalidades de predição (coluna direita)
- Dashboard com gráficos e métricas avançadas