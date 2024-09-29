import axios from 'axios';
import styles from './ProductDetails.module.css'
import ProductDetailsButton from '@/components/ProductDetailsButton/ProductDetailsButton';
import ProductDetails from '@/components/ProductDetails/ProductDetails';
// Função para obter os dados do produto
const getProductData = async (name, productId, token, apiUrl) => {
  const encodedProductName = encodeURIComponent(name);
  const response = await axios.get(
    `${apiUrl}/api/product/${encodedProductName}/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.product;
};

// Exportando a metadata
export async function generateMetadata({ params }) {
  const { productId, name } = params;
  const token = 'your_auth_token'; // Substitua pelo seu token
  const apiUrl = 'https://serveradmin-whhj.onrender.com';

  let productData = null;

  try {
    productData = await getProductData(name, productId, token, apiUrl);
  } catch (error) {
    console.error('Erro ao obter detalhes do produto:', error);
  }
 
    const canonicalUrl = `http://localhost:5012/products/${name}/${productId}`; // Substitua pela URL canônica correta

  return {
    title: productData ? productData.name : "Produto não encontrado",
    description: productData ? productData.description : "Descrição padrão do produto",
    alternates: {
      canonical: canonicalUrl, // Adicionando a tag canônica
    },
  };
}

// Componente da página
const ProductPage = async ({ params }) => {
  const { productId, name } = params;
  const token = 'your_auth_token'; // Substitua pelo seu token
  const apiUrl = 'https://serveradmin-whhj.onrender.com';

  let productData = null;

  try {
    productData = await getProductData(name, productId, token, apiUrl);
  } catch (error) {
    console.error('Erro ao obter detalhes do produto:', error);
  }
  
  return (
    <div>
      {productData ? (
        <>
{/*   
          <h1>{productData.name}</h1>
          <h2>{productData.description}</h2>
          <img src={productData.variations[0]?.urls[0]} alt={productData.name} /> */}
          {/* Renderize as variações e tamanhos conforme necessário */}
          <ProductDetails productId={productId} name={name}/>
        </>
      ) : (
        <h1>Produto não encontrado</h1>
      )}
    </div>
  );
};

export default ProductPage;
