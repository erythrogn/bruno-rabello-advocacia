import os
import json
import urllib.parse
from flask import Flask, render_template
import requests
from dateutil import parser

app = Flask(__name__)

# --- CLIENTE SANITY PERSONALIZADO (Para substituir a lib quebrada) ---
class SanityClient:
    def __init__(self, project_id, dataset, use_cdn=True, token=None):
        self.project_id = project_id
        self.dataset = dataset
        self.token = token
        # Usa cdn.sanity.io para leitura rápida (cache) ou api.sanity.io para dados frescos
        subdomain = 'api' if not use_cdn else 'apicdn'
        self.base_url = f"https://{project_id}.{subdomain}.sanity.io/v2021-10-21/data/query/{dataset}"

    def fetch(self, query, params=None):
        """
        Executa uma query GROQ no Sanity.
        :param query: A string da query GROQ
        :param params: Dicionário de parâmetros (ex: {'slug': 'meu-post'})
        """
        try:
            # Prepara os parâmetros da URL
            request_params = {'query': query}
            
            # Se houver parâmetros ($slug), adiciona-os formatados para a URL
            if params:
                for key, value in params.items():
                    # Sanity exige aspas em strings nos parâmetros
                    if isinstance(value, str):
                        request_params[f'${key}'] = f'"{value}"'
                    else:
                        request_params[f'${key}'] = json.dumps(value)

            headers = {}
            if self.token:
                headers['Authorization'] = f'Bearer {self.token}'

            response = requests.get(self.base_url, params=request_params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            return data.get('result', [])
            
        except requests.exceptions.RequestException as e:
            print(f"Erro na conexão com Sanity: {e}")
            return None

# --- CONFIGURAÇÃO ---
# Inicializa o nosso cliente personalizado
client = SanityClient(
    project_id='pq9zuw6q',
    dataset='production',
    use_cdn=False # False para garantir que vejamos atualizações na hora
)

# --- FUNÇÕES AUXILIARES ---

# Filtro para formatar data no HTML (Ex: 16 JAN 2026)
@app.template_filter('data_formatada')
def data_formatada(value):
    if not value: return ""
    try:
        dt = parser.parse(value)
        meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
        return f"{dt.day:02d} {meses[dt.month-1]} {dt.year}"
    except:
        return value

# --- ROTAS ---

@app.route('/')
def index():
    # Busca posts para o carrossel
    query = """
    *[_type == "post"] | order(publishedAt desc) {
      title,
      slug,
      publishedAt,
      description,
      "category": categories[0]->title,
      "imageUrl": mainImage.asset->url,
      "author": author->name
    }
    """
    posts = client.fetch(query) or []
    return render_template('index.html', posts=posts)

# Rotas Institucionais
@app.route('/sobre-advogado-bruno-rabello')
def sobre():
    return render_template('sobre_advogado_brunorabello.html')

@app.route('/contato-advogado-bruno-rabello')
def contato():
    return render_template('contato_brunorabello.html')

# Rota de Listagem do Blog
@app.route('/blog-juridico')
def blog():
    # Busca os posts ordenados por data
    query = """
    *[_type == "post"] | order(publishedAt desc) {
      title,
      slug,
      publishedAt,
      description,
      "category": categories[0]->title,
      "imageUrl": mainImage.asset->url,
      "author": author->name
    }
    """
    posts = client.fetch(query) or [] # Garante que retorna lista vazia se der erro
    return render_template('blog.html', posts=posts)

# Rota de Detalhe do Post
@app.route('/blog/<slug>')
def post_detalhe(slug):
    # Busca post específico pelo slug
    query = """
    *[_type == "post" && slug.current == $slug][0] {
      title,
      publishedAt,
      updatedAt,
      body,
      "imageUrl": mainImage.asset->url,
      "author": author->name,
      "category": categories[0]->title,
      description,
      slug
    }
    """
    post = client.fetch(query, {'slug': slug})
    
    if post:
        # Busca posts relacionados (mesma categoria)
        if post.get('category'):
            related_query = """
            *[_type == "post" && categories[0]->title == $category && slug.current != $slug] | order(publishedAt desc) [0...3] {
              title,
              slug,
              publishedAt,
              description,
              "category": categories[0]->title,
              "imageUrl": mainImage.asset->url
            }
            """
            related_posts = client.fetch(related_query, {'category': post['category'], 'slug': slug}) or []
        else:
            related_posts = []
        
        return render_template('post_detalhe.html', post=post, related_posts=related_posts)
    else:
        return render_template('404.html'), 404

# Rotas de Áreas de Atuação
@app.route('/atuacao/direito-bancario')
def bancario():
    return render_template('areas/bancario.html')

@app.route('/atuacao/direito-previdenciario')
def previdenciario():
    return render_template('areas/previdenciario.html')

@app.route('/atuacao/direito-consumidor')
def consumidor():
    return render_template('areas/consumidor.html')

# Tratamento de Erros
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(debug=True)