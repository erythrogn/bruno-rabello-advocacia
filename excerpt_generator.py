# utils/excerpt_generator.py
# Função para gerar excerpt das primeiras linhas do post

def generate_excerpt(portable_text_body, max_lines=2, max_chars=150):
    """
    Gera um excerpt (resumo) das primeiras linhas de um corpo em Portable Text.
    
    Args:
        portable_text_body (list): Array de blocos do Portable Text (post.body)
        max_lines (int): Número máximo de linhas/parágrafos a incluir
        max_chars (int): Número máximo de caracteres
        
    Returns:
        str: Texto do excerpt com "..." no final
    """
    if not portable_text_body or not isinstance(portable_text_body, list):
        return ""
    
    text_parts = []
    lines_count = 0
    
    for block in portable_text_body:
        # Para em tipos que não sejam texto normal
        if block.get('_type') != 'block':
            continue
            
        # Para se já pegamos as linhas necessárias
        if lines_count >= max_lines:
            break
        
        # Extrai o texto dos children do bloco
        children = block.get('children', [])
        block_text = ""
        
        for child in children:
            if child.get('_type') == 'span':
                block_text += child.get('text', '')
        
        # Adiciona o texto se não estiver vazio
        if block_text.strip():
            text_parts.append(block_text.strip())
            lines_count += 1
    
    # Junta as partes
    full_text = " ".join(text_parts)
    
    # Limita o tamanho se necessário
    if len(full_text) > max_chars:
        full_text = full_text[:max_chars].rsplit(' ', 1)[0]
    
    # Adiciona "..." no final
    if full_text:
        return full_text + "..."
    
    return ""


# Exemplo de uso em sua rota Flask:
"""
@app.route('/blog/<slug>')
def post_detalhe(slug):
    # Busca o post do Sanity
    post = sanity_client.get_post_by_slug(slug)
    
    # Gera o excerpt se não existir
    if not post.get('excerpt'):
        post['excerpt'] = generate_excerpt(post.get('body', []))
    
    # Para posts relacionados também
    related_posts = sanity_client.get_related_posts(post)
    for related in related_posts:
        if not related.get('excerpt'):
            related['excerpt'] = generate_excerpt(related.get('body', []))
    
    return render_template('post_detalhe.html', 
                         post=post, 
                         related_posts=related_posts)
"""


# Versão alternativa: gerar excerpt no momento da consulta ao Sanity
def add_excerpt_to_posts(posts):
    """
    Adiciona excerpt a uma lista de posts.
    
    Args:
        posts (list): Lista de posts do Sanity
        
    Returns:
        list: Posts com campo excerpt adicionado
    """
    for post in posts:
        if not post.get('excerpt'):
            post['excerpt'] = generate_excerpt(post.get('body', []))
    return posts
