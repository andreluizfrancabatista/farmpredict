import pandas as pd

# Caminho do arquivo .xlsx
xlsx_file = 'data\RLH021_henrique.fernandes_798-0.xlsx'

# Nome da planilha que você quer converter (ou use sheet_name=0 para a primeira)
sheet_name = 'Plan1'  # ou o nome da aba, como 'Planilha1'

# Caminho de saída do arquivo .csv
csv_file = 'data\painel.csv'

# Leitura do Excel
df = pd.read_excel(xlsx_file, sheet_name=sheet_name)

# Salvando como CSV (sem índice extra)
df.to_csv(csv_file, index=False)

print(f'Arquivo CSV salvo como: {csv_file}')
