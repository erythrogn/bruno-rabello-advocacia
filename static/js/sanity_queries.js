// sanity_queries.js
// Queries GROQ para incluir excerpt automaticamente

// Query para post individual com excerpt
const POST_DETAIL_QUERY = `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    author,
    publishedAt,
    updatedAt,
    "imageUrl": mainImage.asset->url,
    body,
    category,
    // Gera excerpt das primeiras 2 linhas de texto
    "excerpt": array::join(
      body[_type == "block"][0..1].children[].text,
      " "
    ) + "...",
    // Ou de forma mais refinada:
    "excerptClean": string::slice(
      array::join(
        body[_type == "block"][0..1].children[].text,
        " "
      ),
      0,
      150
    ) + "..."
  }
`;

// Query para lista de posts com excerpt
const POSTS_LIST_QUERY = `
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    author,
    publishedAt,
    "imageUrl": mainImage.asset->url,
    category,
    // Excerpt automático das primeiras 2 linhas
    "excerpt": string::slice(
      array::join(
        body[_type == "block"][0..1].children[].text,
        " "
      ),
      0,
      150
    ) + "..."
  }
`;

// Query para posts relacionados com excerpt
const RELATED_POSTS_QUERY = `
  *[_type == "post" && category == $category && slug.current != $currentSlug][0..2] {
    _id,
    title,
    slug,
    "imageUrl": mainImage.asset->url,
    category,
    "excerpt": string::slice(
      array::join(
        body[_type == "block"][0..1].children[].text,
        " "
      ),
      0,
      150
    ) + "..."
  }
`;

// Exportar as queries
module.exports = {
  POST_DETAIL_QUERY,
  POSTS_LIST_QUERY,
  RELATED_POSTS_QUERY
};


// EXEMPLO DE USO EM PYTHON COM SANITY CLIENT:
/*
from sanity import Client

client = Client({
    'project_id': 'seu-project-id',
    'dataset': 'production',
    'api_version': '2023-01-01',
    'use_cdn': True
})

# Query GROQ com excerpt
query = '''
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    author,
    publishedAt,
    "imageUrl": mainImage.asset->url,
    body,
    "excerpt": string::slice(
      array::join(
        body[_type == "block"][0..1].children[].text,
        " "
      ),
      0,
      150
    ) + "..."
  }
'''

params = {'slug': 'seu-slug-aqui'}
post = client.fetch(query, params)
*/
