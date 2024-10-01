const CATEGORIES_DATA_URL = 'https://revendedor-api.onrender.com/api/categories';
const PRODUCTS_DATA_URL = 'https://revendedor-api.onrender.com/api/all-products';
 // Função para formatar as categorias
 const formatName = (name) => {
    return name
      .replace(/ /g, '-') // Substitui espaços por hífens
      .normalize('NFD') // Normaliza para separar acentos
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  };
  
function generateSiteMap(categories, products) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- URLs fixas -->
    <url>
      <loc>https://jsonplaceholder.typicode.com</loc>
    </url>
    <url>
      <loc>https://jsonplaceholder.typicode.com/guide</loc>
    </url>
    ${categories
      .map(({ name }) => {
        return `
      <url>
        <loc>${`https://revendedor.mediewal.com.br/categories/${name}`}</loc>
      </url>
    `;
      })
      .join('')}
         ${products
      .map(({ name, _id }) => {
        return `
      <url>
        <loc>${`https://revendedor.mediewal.com.br/products/${formatName(name)}/${_id}`}</loc>
      </url>
    `;
      })
      .join('')}
  </urlset>`;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  // Fazemos uma chamada à API para coletar as URLs
  const request = await fetch(CATEGORIES_DATA_URL);
  const { categories } = await request.json(); // Altere para desestruturar 'categories'
  const requesProducts = await fetch(PRODUCTS_DATA_URL);
  const { products } = await requesProducts.json(); // Altere para desestruturar 'categories'
 console.log(products)
   
  // Geramos o XML do sitemap com os dados das categorias
  const sitemap = generateSiteMap(categories, products);

  res.setHeader('Content-Type', 'text/xml');
  // Enviamos o XML para o navegador
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
