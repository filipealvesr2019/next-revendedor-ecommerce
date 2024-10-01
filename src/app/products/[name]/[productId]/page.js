import React from 'react';

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
  console.log("product detail", response.data.product)
  return response.data.product;
};

// Exportando a metadata
export async function generateMetadata({ params }) {
  const { productId, name } = params;
  const token = 'your_auth_token'; // Substitua pelo seu token
  const apiUrl = 'https://revendedor-api.onrender.com';

  let productData = null;

  try {
    productData = await getProductData(name, productId, token, apiUrl);
  } catch (error) {
    console.error('Erro ao obter detalhes do produto:', error);
  }
   // Função para formatar as categorias
   const formatCategory = (category) => {
    // Remove os hífens e aplica normalização
    return category
      .replace(/-/g, ' ') // Substitui hífens por espaços
      .normalize('NFD') // Normaliza para separar acentos
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  };

  const keywords = productData ? {
    category: formatCategory(productData.category),
    subcategory: formatCategory(productData.subcategory),
  } : {};

    const canonicalUrl = `https://revendedor.mediewal.com.br/products/${name}/${productId}`; // Substitua pela URL canônica correta

  return {
    title: productData ? productData.name : "Produto não encontrado",
    description: productData ? productData.description : "Descrição padrão do produto",
    alternates: {
      canonical: canonicalUrl, // Adicionando a tag canônica
    },
    keywords: [keywords.category, keywords.subcategory],
  };
}

// Componente da página
const ProductPage = async ({ params }) => {
  const { productId, name } = params;
  const token = 'your_auth_token'; // Substitua pelo seu token
  const apiUrl = 'https://revendedor-api.onrender.com';

  let productData = null;

  try {
    productData = await getProductData(name, productId, token, apiUrl);
  } catch (error) {
    console.error('Erro ao obter detalhes do produto:', error);
  }
  const formatProductNameForUrl = (productName) => {
    return productName
      .toLowerCase() // Converte para letras minúsculas
      .replace(/\s+/g, '-') // Substitui espaços por traços
      .replace(/[^\w-]+/g, ''); // Remove caracteres especiais (exceto traços e letras)
  };
  
// Cria o JSON-LD para o produto específico
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": productData.name,
  "image": productData.variations[0].urls[0], // A primeira imagem da variação
  "description": productData.description,
  "sku": productData._id,
  "offers": {
    "@type": "Offer",
    "url": `https://revendedor.mediewal.com.br/products/${formatProductNameForUrl(productData.name)}/${productData._id}`,
    "priceCurrency": "BRL",
    "price": productData.variations[0].sizes[0].price, // Preço do primeiro tamanho
    "availability": productData.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
  },
};
  return (
    <div>
      {productData ? (
        <>
  <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
          <ProductDetails productId={productId} name={name}/>
        </>
      ) : (
        <h1>Produto não encontrado</h1>
      )}
    </div>
  );
};

export default ProductPage;
