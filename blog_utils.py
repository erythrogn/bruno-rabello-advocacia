"""
Blog Utils - Conexão Sanity para Letreiro e Home
"""
import requests

# IMPORTANTE: Use o mesmo ID que está no app.py
PROJECT_ID = 'pq9zuw6q'
DATASET = 'production'
SANITY_URL = f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/{DATASET}"

def buscar_dados_sanity(query):
    try:
        response = requests.get(SANITY_URL, params={'query': query})
        if response.status_code == 200:
            return response.json().get('result', [])
        return []
    except Exception as e:
        print(f"Erro no blog_utils: {e}")
        return []

def extrair_artigos_recentes(limite=5):
    """
    Busca apenas os títulos dos artigos recentes para o letreiro.
    Retorna uma lista de strings simples.
    """
    query = f'*[_type == "post"] | order(publishedAt desc) [0...{limite}] {{title}}'
    
    resultados = buscar_dados_sanity(query)
    
    if resultados:
        # Transforma [{'title': 'A'}, {'title': 'B'}] em ['A', 'B']
        return [item['title'] for item in resultados]
    
    # Fallback caso a API falhe ou não tenha posts
    return [
        "Confira nossos artigos sobre Direito Bancário",
        "Planejamento Previdenciário: Maximize sua aposentadoria",
        "Direito do Consumidor: Saiba seus direitos"
    ]

# As outras funções podem ser simplificadas ou removidas se não usadas
def extrair_artigos_blog():
    return extrair_artigos_recentes(10)