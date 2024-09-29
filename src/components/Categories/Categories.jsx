 "use client"
import React, { useState, useEffect } from "react";
import styles from "./Categories.module.css";
import ImageGallery from "./ImageGallery/ImageGallery";
import { useConfig } from "../../../context/ConfigContext";

const Categories = () => {
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
        marginTop: "15rem",
        marginBottom: "10rem",
      }}
      className={styles.ImageGallery}
    >
  
   
      <ImageGallery />
    </div>
  );
};

export default Categories;
