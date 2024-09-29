"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useConfig } from "../../../../context/ConfigContext";
import Link from "next/link";

const ImageGalleryMobile = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  
  const { apiUrl } = useConfig();


  useEffect(() => {
    const fetchData = async () => {
      try {
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
      } catch (error) {
        setError(`Error fetching categories: ${error.message}`);
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ position: "relative" }}>
       {/* {location.pathname === "/categorias" && (
        <Helmet>
          <title>Categorias - Loja Mediewal</title>
          <meta
            name="description"
            content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
          />
        </Helmet>
      )} */}
      <h2 style={{ marginLeft: "2rem" }}>Categorias</h2>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {categories.map((category) => (
          <div
            key={category._id}
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
                  <Link href={`/categories/${encodeURIComponent(category.name)}`}>
                    <img
                      src={image.imageUrl}
                      alt={`Image ${image._id}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "20%",
                        aspectRatio: "1/1",
                      }}
                    />
                  </Link>
                  <div style={{ marginTop: "5px" }}>{category.name.replace(/-/g, " ")}</div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGalleryMobile;
