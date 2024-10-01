import CategoriesComponent from "@/components/CategoriesComponent/CategoriesComponent";
import axios from "axios";
import React from 'react';

// Função para obter os dados do produto
const getProductData = async (category, token, apiUrl) => {
  const encodedProductName = encodeURIComponent(category);
  
  const response = await axios.get(
    `${apiUrl}/api/categories/${encodedProductName}/mixedProducts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const uniqueSubcategories = [...new Set(response.data.mixedProducts.map((product) => product.subcategory))];

  return {
    products: response.data.mixedProducts,
    uniqueSubcategories,
  };
};
// Exportando a metadata
export async function generateMetadata({ params }) {
  const { category } = params;
  const token = "your_auth_token"; // Substitua pelo seu token
  const apiUrl = "https://revendedor-api.onrender.com";

  let productData = null;

  try {
    productData = await getProductData(category, token, apiUrl);
  } catch (error) {
    console.error("Erro ao obter detalhes do produto:", error);
  }
  const keywords = productData?.uniqueSubcategories ? productData.uniqueSubcategories.join(', ') : '';

  const canonicalUrl = `https://revendedor.mediewal.com.br/categories/${category}`; // Substitua pela URL canônica correta
  // Define metadados dinâmicos com base na categoria
  switch (category) {
    case "moda-dri-fit":
      return {
        title: "Moda Dri-Fit",
        description: "Confira os melhores produtos Dri-Fit.",
        alternates: {
          canonical: canonicalUrl, // Tag canônica
        },
        keywords: [keywords,'Moda Dri Fit', 'Moda Dry Fit', 'Moda Dry Fit Masculina', 'Moda Dri Fit Masculina'],

      };
    
    case "camiseta-performance":
      return {
        title: "Camiseta Performance",
        description:  "Explore a nova linha de camisetas.",
        alternates: {
          canonical: canonicalUrl,
        },
        keywords: [keywords, 'camiseta masculina', 'camisetas masculinas', 'camisetas'],

      };

    case "calcao-masculino":
      return {
        title: "Calção Masculino",
        description:  "Explore a nova linha de Calções.",
        alternates: {
          canonical: canonicalUrl,
        },
        keywords: [keywords, 'Calção Masculino', 'Calção', 'Shorts Masculinos'],

      };
      case "calcao-dri-fit":
        return {
          title: "Calção Dri Fit",
          description:  "Explore a nova linha de Calções Dri Fit.",
          alternates: {
            canonical: canonicalUrl,
          },
          keywords: [keywords, 'Calção Dri Fit', 'Calção Dry Fit'],

        };

      
    default:
      return {
        title: 'Loja Mediewal',
        description: "Somos a Mediewal, uma marca de roupas masculinas criada para quem quer se vestir bem e reinar no estilo. Inspirada no conceito de elegância  e confiança.",
        alternates: {
          canonical: canonicalUrl,
        },
        
      };
  }
}

// Componente da página
const CategoriesPage = async ({ params }) => {
  const { category } = params;
  const token = "your_auth_token"; // Substitua pelo seu token
  const apiUrl = "https://revendedor-api.onrender.com";

  let productData = null;

  try {
    productData = await getProductData(category, token, apiUrl);
  } catch (error) {
    console.error("Erro ao obter detalhes do produto:", error);
  }

  const formatProductNameForUrl = (productName) => {
    return productName
      .toLowerCase() // Converte para letras minúsculas
      .replace(/\s+/g, '-') // Substitui espaços por traços
      .replace(/[^\w-]+/g, ''); // Remove caracteres especiais (exceto traços e letras)
  };
  
 // Cria o JSON-LD para os produtos
 const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": `Produtos da categoria ${category}`,
  "itemListElement": productData?.products.map((product, index) => {
    const imageUrls = product.variations.map(variation => variation.urls[0]); // A primeira imagem de cada variação
    const firstSize = product.variations[0]?.sizes[0]; // Acessando o primeiro tamanho da primeira variação
    const url = `https://revendedor.mediewal.com.br/products/${formatProductNameForUrl(product.name)}/${product._id}`; // URL canônica correta

    return {
      "@type": "Product",
      "position": index + 1,
      "name": product.name,
      "image": imageUrls[0], // URL da primeira imagem do produto
      "description": product.description,
      "sku": product._id,
      "offers": {
        "@type": "Offer",
        "url": url,
        "priceCurrency": "BRL",
        "price": firstSize && firstSize.price , // Preço do primeiro tamanho, ou 0 se não existir
        "availability": "https://schema.org/InStock",
      },
    
    };
  }),
};

  return (
    <div>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />


      <CategoriesComponent category={category} />
    </div>
  );
};

export default CategoriesPage;
