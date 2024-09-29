import React, { useState, useEffect } from "react";
import axios from "axios";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import styles from "./ImageGallery.module.css";
import SkeletonCategories from "@/components/Skeletons/SkeletonCategories";
import { useConfig } from "../../../../context/ConfigContext";
import Link from "next/link";
export const metadata = {
  title: 'Categorias - Loja Mediewal', // Define o título da página
  description: 'Veja as últimas novidades em nossa loja, com uma seleção de produtos novos.', // Descrição da página
 
};
const ImageGallery = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [categoriesPerPage] = useState(6);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = useConfig();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await axios.get(`${apiUrl}/api/categories`);
        console.log("Categories Response:", response.data);

        if (
          response.data.categories &&
          Array.isArray(response.data.categories)
        ) {
          setCategories(response.data.categories);
        } else {
          setCategories([]);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(`Error fetching categories: ${error.message}`);
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  const nextPage = () => {
    const nextIndex = currentPage + 1;
    if (nextIndex * categoriesPerPage < categories.length) {
      setCurrentPage(nextIndex);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = currentPage * categoriesPerPage;
  const endIndex = Math.min(startIndex + categoriesPerPage, categories.length);

  const isBackDisabled = currentPage === 0;
  const isForwardDisabled = endIndex >= categories.length;
 const handleCategoryName = (name) => {
  switch(name){
    case 'calcao masculino':
      return 'calção masculino'
    case 'calcao dri fit':
      return 'calção dri fit'
    default:
      return name
  }
 }

 
  return (
    <>
      {loading ? (
        <SkeletonCategories />
      ) : (
        <div style={{ position: "relative" }}>
       
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              position: "relative",
              marginTop: "-10rem",
            }}
          >
            {categories.slice(startIndex, endIndex).map((category, index) => (
              <div
                key={index}
                style={{
                  width: "150px",
                  height: "150px",
                  margin: "10px",
                  textAlign: "center",
                }}
              >
                {category.images.map((subcategoryImages, index) =>
                  subcategoryImages.map((image) => (
                    <div key={image._id}>
                      <Link
                        href={`/categories/${category.name}`}
                      >
                        <img
                          src={image.imageUrl}
                          alt={`Image ${image._id}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                            aspectRatio: "1/1",
                          }}
                        />
                      </Link>
                      <span
                        style={{
                          marginTop: "5px",
                          fontFamily: "poppins",
                          fontWeight: "400",
                          fontSize: "1rem",
                          color: "#666",
                        }}
                      >
                     {handleCategoryName(category.name.replace(/-/g, " "))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
          {categories.length > 0 ? (
            <>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10%",
                  transform: "translateY(-50%)",
                }}
                className={styles.arrowLeft}
              >
                <ArrowBackIosNewRoundedIcon
                  onClick={prevPage}
                  disabled={isBackDisabled}
                  style={{
                    fontSize: "2.5rem",
                    cursor: "pointer",
                    color: isBackDisabled ? "rgb(189, 189, 189)" : "",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10%",
                  transform: "translateY(-50%)",
                }}
                className={styles.arrowRight}
              >
                <ArrowForwardIosRoundedIcon
                  onClick={nextPage}
                  disabled={isForwardDisabled}
                  style={{
                    fontSize: "2.5rem",
                    cursor: "pointer",
                    color: isForwardDisabled ? "rgb(189, 189, 189)" : "",
                  }}
                />
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;
