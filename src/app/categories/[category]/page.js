import CategoriesComponent from "@/components/CategoriesComponent/CategoriesComponent";
import axios from "axios";

// Função para obter os dados do produto
const getProductData = async (category, token, apiUrl) => {
  const encodedProductName = encodeURIComponent(category);
  const response = await axios.get(
    `${apiUrl}/api/categories/${encodedProductName}`,
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
  const { category } = params;
  const token = "your_auth_token"; // Substitua pelo seu token
  const apiUrl = "https://serveradmin-whhj.onrender.com";

  let productData = null;

  try {
    productData = await getProductData(category, token, apiUrl);
  } catch (error) {
    console.error("Erro ao obter detalhes do produto:", error);
  }

  const canonicalUrl = `http://localhost:5012/categories/${category}`; // Substitua pela URL canônica correta
  // Define metadados dinâmicos com base na categoria
  switch (category) {
    case "moda-dri-fit":
      return {
        title: "Moda Dri-Fit",
        description: "Confira os melhores produtos Dri-Fit.",
        alternates: {
          canonical: canonicalUrl, // Tag canônica
        },
      };
    
    case "camiseta-performance":
      return {
        title: "Camiseta Performance",
        description:  "Explore a nova linha de camisetas.",
        alternates: {
          canonical: canonicalUrl,
        },
      };

    case "calcao-masculino":
      return {
        title: "Calção Masculino",
        description:  "Explore a nova linha de Calções.",
        alternates: {
          canonical: canonicalUrl,
        },
      };
      case "calcao-dri-fit":
        return {
          title: "Calção Dri Fit",
          description:  "Explore a nova linha de Calções Dri Fit.",
          alternates: {
            canonical: canonicalUrl,
          },
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
const ProductPage = async ({ params }) => {
  const { category } = params;
  const token = "your_auth_token"; // Substitua pelo seu token
  const apiUrl = "https://serveradmin-whhj.onrender.com";

  let productData = null;

  try {
    productData = await getProductData(category, token, apiUrl);
  } catch (error) {
    console.error("Erro ao obter detalhes do produto:", error);
  }

  return (
    <div>
      <CategoriesComponent category={category} />
    </div>
  );
};

export default ProductPage;
