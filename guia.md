# FarmPredict MVP - Guia do Usuário

Este documento orienta como utilizar o **FarmPredict MVP (Minimal Viable Product)** e como solicitar melhorias, correções e novas funcionalidades.

## 🎯 O que é este MVP?

O **FarmPredict MVP** é a **versão inicial** da aplicação de análise de dados de colheita de cana-de-açúcar. Esta versão contém as funcionalidades essenciais para validar o conceito e coletar feedback dos usuários.

### ✅ Funcionalidades Implementadas no MVP
- **Carregamento de dados CSV** por horário específico
- **Visualização de dados** de produtividade das colhedoras
- **Cálculos automáticos** de métricas de produção
- **Sistema de estimativas** para próximos 60 minutos
- **Inteligência do negócio** com projeção de metas
- **Interface responsiva** para desktop e mobile

### ⚠️ Limitações Conhecidas do MVP
- Dados limitados a arquivos CSV estáticos
- Sem autenticação de usuários
- Sem persistência de configurações
- Funcionalidades limitadas de relatórios
- Sem integração com sistemas externos

---

## 🚀 Como Usar o MVP

### Passo 1: Acessar a Aplicação
1. Abra seu navegador web
2. Acesse a URL da aplicação (fornecida pela equipe)
3. Aguarde o carregamento da interface

### Passo 2: Carregar Dados
1. **Selecione um horário** no menu suspenso (00:00 até 23:00)
2. **Clique no botão "Carregar"** para buscar os dados
3. Aguarde o processamento (poucos segundos)

### Passo 3: Analisar os Dados

#### 📊 Coluna Esquerda - Dados de Colheita
- Visualize a **produtividade atual** de cada equipamento
- Analise **toneladas por dia**, **ton/hora** e **tempo produtivo**
- Compare **eficiência entre diferentes colhedoras**

#### 📈 Coluna Direita Superior - Estimativas
- Veja **projeções para os próximos 60 minutos**
- Analise **tempo efetivo vs. improdutivo** por equipamento
- Observe **toneladas projetadas** por equipamento

#### 🧠 Coluna Direita Inferior - Inteligência do Negócio
1. **Digite uma meta** de produção (ex: 100 toneladas)
2. **Pressione Enter** ou clique em "Calcular"
3. Analise os resultados:
   - Tempo adicional necessário
   - Hora prevista para atingir a meta
   - Insights para otimização

### Passo 4: Interpretar os Resultados

#### 🎯 Cenários Possíveis

**Meta Já Alcançada** ✅
```
🎉 Meta já alcançada!
Excesso de X toneladas por hora
💡 Sugestão: Mantenha a produção atual
```

**Meta Requer Tempo Adicional** ⏱️
```
⏱️ Para atingir sua meta de X toneladas
Tempo adicional: XX minutos
Hora prevista: XX:XX
💡 Sugestão: Aumente a taxa em X% para 60min
```

#### 📋 Dicas de Uso
- **Teste diferentes horários** para ver evolução da produção
- **Compare estimativas** entre equipamentos
- **Use metas realistas** baseadas na produção atual
- **Monitore tempo produtivo** vs. improdutivo

---

*Última atualização: [20/06/2025]*