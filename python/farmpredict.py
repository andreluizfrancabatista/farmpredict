# -*- coding: utf-8 -*-
"""farmpredict.py - Versão Atualizada

Script para gerar dados de produtividade de colhedoras com cálculos realistas
"""

import pandas as pd
import numpy as np
from datetime import datetime, time
import random

# Configurações de exibição do pandas
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
pd.set_option('display.max_colwidth', None)

# Configurar seed para reprodutibilidade (opcional)
np.random.seed(42)
random.seed(42)

print("🚜 Iniciando processamento dos dados de colheita...")

# Lê o CSV
url = 'https://raw.githubusercontent.com/andreluizfrancabatista/farmpredict/main/data/painel.csv'
df = pd.read_csv(url)

print(f"📊 Dados carregados: {len(df)} registros")

# Adiciona colunas que serão calculadas
df['Toneladas por dia (acumulada)'] = 0.0
df['Toneladas por hora'] = 0.0
df['Tempo produtivo (acumulado)'] = 0.0  # em horas (float)
df['Toneladas por hora efetiva'] = 0.0

# Remove colunas desnecessárias
colunas_remover = [
    'Descrição Regional', 'Descrição da Unidade', 'Descrição do Equipamento',
    'Código de Operador', 'Nome', 'Código da Operação', 'Descrição da Operação',
    'Código da Fazenda', 'Código da Zona', 'Código do Talhão', 'Descrição da Fazenda',
    'Horímetro/Odometro Inicial', 'Horímetro/Odometro Final', 'Horímetro/Odometro Secundário',
    'Velocidade Média'
]
df.drop(columns=colunas_remover, inplace=True)

# Converte 'Data Hora Local' para datetime
df['Data Hora Local'] = pd.to_datetime(df['Data Hora Local'], dayfirst=True, errors='coerce')

# Concatena data com hora inicial/final
df['Hora Inicial'] = pd.to_datetime(
    df['Data Hora Local'].dt.date.astype(str) + ' ' + df['Hora Inicial'],
    errors='coerce'
)

df['Hora Final'] = pd.to_datetime(
    df['Data Hora Local'].dt.date.astype(str) + ' ' + df['Hora Final'],
    errors='coerce'
)

# Calcula tempo da operação em horas
df['tempo_operacao'] = (df['Hora Final'] - df['Hora Inicial']).dt.total_seconds() / 3600

# Marca tempo produtivo quando operação for PRODUTIVA
df['tempo_produtivo'] = df.apply(
    lambda row: row['tempo_operacao'] if str(row['Descrição do Grupo da Operação']).strip().upper() == 'PRODUTIVA' else 0,
    axis=1
)

# Calcula tempo produtivo acumulado por equipamento
df = df.sort_values(['Código Equipamento', 'Hora Inicial'])
df['Tempo produtivo (acumulado)'] = df.groupby('Código Equipamento')['tempo_produtivo'].cumsum()

def format_timedelta_sem_days(td_series):
    """Converte horas decimais para formato hh:mm:ss"""
    if isinstance(td_series, pd.Series):
        total_seconds = (td_series * 3600).astype(int)
    else:
        total_seconds = int(td_series * 3600)
    
    if isinstance(total_seconds, pd.Series):
        horas = total_seconds // 3600
        minutos = (total_seconds % 3600) // 60
        segundos = total_seconds % 60
        return horas.astype(str).str.zfill(2) + ':' + \
               minutos.astype(str).str.zfill(2) + ':' + \
               segundos.astype(str).str.zfill(2)
    else:
        horas = total_seconds // 3600
        minutos = (total_seconds % 3600) // 60
        segundos = total_seconds % 60
        return f"{horas:02d}:{minutos:02d}:{segundos:02d}"

def gerar_produtividade_realista(equipamento, tempo_produtivo_horas):
    """
    Gera produtividade realista baseada no equipamento e tempo produtivo
    Retorna toneladas por hora efetiva entre 40-70 com variação por equipamento
    """
    # Cria uma "personalidade" para cada equipamento baseada no seu código
    random.seed(hash(str(equipamento)) % 1000)
    
    # Taxa base específica para cada equipamento (entre 45-65 ton/h)
    taxa_base = 45 + (hash(str(equipamento)) % 20)
    
    # Variação aleatória diária (-10% a +15%)
    variacao_diaria = random.uniform(0.90, 1.15)
    
    # Fadiga ao longo do dia (redução gradual)
    if tempo_produtivo_horas > 8:
        fadiga = max(0.85, 1 - (tempo_produtivo_horas - 8) * 0.02)
    else:
        fadiga = 1.0
    
    # Taxa final
    taxa_efetiva = taxa_base * variacao_diaria * fadiga
    
    # Garante que fica entre 40-70
    taxa_efetiva = max(40, min(70, taxa_efetiva))
    
    return taxa_efetiva

# Dicionário para armazenar dados acumulados por equipamento
equipamentos_dados = {}

print("⚙️ Processando dados por horário...")

# Loop para as horas de 01h até 23h
for h in range(1, 24):
    hora_referencia = time(h, 0)
    
    print(f"   Processando horário: {h:02d}:00")
    
    # Filtra registros que estão ativos neste horário
    df_hora = df[
        (df['Hora Inicial'].dt.time <= hora_referencia) &
        (df['Hora Final'].dt.time > hora_referencia)
    ].copy()
    
    if df_hora.empty:
        print(f"   ⚠️ Nenhum dado encontrado para {h:02d}:00")
        continue
    
    # Extrai data e hora como colunas separadas
    df_hora['Data'] = df_hora['Data Hora Local'].dt.date.astype(str)
    df_hora['Hora'] = hora_referencia.strftime('%H:%M')
    
    # Agrupa para pegar o maior valor acumulado por equipamento naquele horário
    df_agrupado = df_hora.groupby(
        ['Descrição do Grupo de Equipamento', 'Código Equipamento', 'Data', 'Descrição do Grupo da Operação'],
        as_index=False
    ).agg({
        'Tempo produtivo (acumulado)': 'max'
    })
    
    # Adiciona a coluna Hora
    df_agrupado['Hora'] = hora_referencia.strftime('%H:%M')
    
    # Processa cada equipamento
    for idx, row in df_agrupado.iterrows():
        equipamento = row['Código Equipamento']
        tempo_prod_horas = row['Tempo produtivo (acumulado)']
        
        # Inicializa dados do equipamento se não existir
        if equipamento not in equipamentos_dados:
            equipamentos_dados[equipamento] = {
                'toneladas_acumuladas': 0.0,
                'ultima_hora': 0
            }
        
        # Calcula toneladas por hora efetiva (taxa de produção)
        ton_hora_efetiva = gerar_produtividade_realista(equipamento, tempo_prod_horas)
        
        # Calcula toneladas produzidas desde a última atualização
        horas_passadas = h - equipamentos_dados[equipamento]['ultima_hora']
        if horas_passadas > 0 and tempo_prod_horas > 0:
            # Produção incremental baseada no tempo produtivo adicional
            tempo_prod_anterior = equipamentos_dados[equipamento].get('tempo_prod_anterior', 0)
            tempo_adicional = max(0, tempo_prod_horas - tempo_prod_anterior)
            toneladas_adicionais = ton_hora_efetiva * tempo_adicional
            equipamentos_dados[equipamento]['toneladas_acumuladas'] += toneladas_adicionais
            equipamentos_dados[equipamento]['tempo_prod_anterior'] = tempo_prod_horas
        elif equipamento not in [eq for eq in equipamentos_dados.keys()]:
            # Primeira vez que vemos este equipamento
            equipamentos_dados[equipamento]['toneladas_acumuladas'] = ton_hora_efetiva * tempo_prod_horas
            equipamentos_dados[equipamento]['tempo_prod_anterior'] = tempo_prod_horas
        
        equipamentos_dados[equipamento]['ultima_hora'] = h
        
        # Toneladas por dia (acumulada)
        ton_dia_acumulada = equipamentos_dados[equipamento]['toneladas_acumuladas']
        
        # Toneladas por hora (considerando o horário atual)
        ton_hora = ton_dia_acumulada / h if h > 0 else 0
        
        # Atualiza os valores na linha
        df_agrupado.at[idx, 'Toneladas por dia (acumulada)'] = round(ton_dia_acumulada, 2)
        df_agrupado.at[idx, 'Toneladas por hora'] = round(ton_hora, 4)
        df_agrupado.at[idx, 'Toneladas por hora efetiva'] = round(ton_hora_efetiva, 4)
    
    # Formata tempo produtivo acumulado para hh:mm:ss
    df_agrupado['Tempo produtivo (acumulado)'] = df_agrupado['Tempo produtivo (acumulado)'].apply(
        lambda x: format_timedelta_sem_days(x)
    )
    
    # Reordena as colunas conforme especificado
    colunas_finais = [
        'Descrição do Grupo de Equipamento',
        'Código Equipamento', 
        'Data',
        'Hora',
        'Descrição do Grupo da Operação',
        'Toneladas por dia (acumulada)',
        'Toneladas por hora',
        'Tempo produtivo (acumulado)',
        'Toneladas por hora efetiva'
    ]
    
    df_final = df_agrupado[colunas_finais].copy()
    
    # Gera o nome do arquivo
    nome_arquivo = f'../data/painel-{h:02d}h00.csv'
    
    # Salva o arquivo CSV
    df_final.to_csv(nome_arquivo, index=False, encoding='utf-8-sig')
    
    print(f"   ✅ Arquivo salvo: {nome_arquivo} ({len(df_final)} registros)")

print("🎉 Processamento concluído! Todos os arquivos CSV foram gerados com dados consistentes.")
print("\n📊 Características dos dados gerados:")
print("   • Toneladas por hora efetiva: 40-70 ton/h (varia por equipamento)")
print("   • Toneladas acumuladas: sempre crescentes ao longo do dia")
print("   • Dados consistentes entre horários")
print("   • Variação realística baseada em fadiga e características do equipamento")