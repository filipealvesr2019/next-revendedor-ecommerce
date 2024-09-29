import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useConfig } from "../context/ConfigContext";

const ImageGalleryDesktop = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { apiUrl } = useConfig();
  const location = useLocation();

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
    <div style={{ position: "relative", marginTop: "-3rem" }}>
       {/* {location.pathname === "/categorias" && (
        <Helmet>
          <title>Categorias - Loja Mediewal</title>
          <meta
            name="description"
            content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
          />
        </Helmet>
      )} */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "10px",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {categories.map((category) => (
          <div
            key={category._id}
            style={{
              width: "100px",
              height: "100px",
              margin: "10px",
              textAlign: "center",
              marginTop: "2rem",
            }}
          >
            {category.images.map((subcategoryImages, index) =>
              subcategoryImages.map((image) => (
                <div key={image._id}>
                  <Link to={`/categories/${encodeURIComponent(category.name)}`}>
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
                  <div style={{ marginTop: "5px", color: "black" }}>
                  {category.name.replace(/-/g, " ")}                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGalleryDesktop;
