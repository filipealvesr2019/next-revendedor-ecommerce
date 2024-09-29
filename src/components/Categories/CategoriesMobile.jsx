import React, { useState, useEffect } from "react";
import ImageGalleryMobile from "./ImageGalleryMobile";
import styles from "./CategoriesMobile.module.css";
import Navbar from "./Navbar";
import { useConfig } from "../context/ConfigContext";

const CategoriesMobile = () => {
  const [categories, setCategories] = useState([]);
  const { apiUrl } = useConfig();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/allCategories`);
        const data = await response.json();

        setCategories((prevCategories) => {
          // Use um conjunto temporário para armazenar categorias únicas
          const uniqueCategoriesSet = new Set([
            ...prevCategories.map((c) => c.category),
            ...data.map((c) => c.category),
          ]);
          const uniqueCategories = Array.from(uniqueCategoriesSet).map(
            (category) => ({ category })
          );

          return uniqueCategories;
        });
      } catch (error) {
        console.error("Erro ao obter categorias:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      style={{
        marginTop: "2rem",
        marginBottom: "10rem",
      }}
      className={styles.ImageGalleryMobile}
    >
    {location.pathname === "/categorias" && (
        <Helmet>
          <title>Categorias - Loja Mediewal</title>
          <meta
            name="description"
            content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
          />
        </Helmet>
      )}


      <ImageGalleryMobile />
      <Navbar />
    </div>
  );
};

export default CategoriesMobile;
