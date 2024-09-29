"use client"
import React, { useEffect, useState } from "react";

import styles from "./SearchResults.module.css";
import Header from "@/components/Header/Header";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Navbar from "@/components/Navbar/Navbar";
import Link from "next/link";
import IconToggle from "@/components/IconToggle/IconToggle";



const SearchResults = ({ params }) => {
  const { query } = params; // Extracting query from URL
  const [searchResults, setSearchResults] = useState([]);
  // ... (rest of your state variables)
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    if (query) {
      fetchSearchResults(); // Fetch results whenever query changes
    }
  }, [query]);

  const fetchSearchResults = async () => {
    try {
      const response = await fetch(
        `https://serveradmin-whhj.onrender.com/api/search/product?searchQuery=${query}`
      );
      const data = await response.json();
      setSearchResults(data.products);
      // Handle additional state updates as necessary
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const removeAccents = (name) => {
    return name
    .normalize("NFD") // Normaliza a string para decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (acentos)
    .toLowerCase() // Converte para letras minúsculas
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/[^\w\-]+/g, ""); // Remove caracteres não alfanuméricos (exceto hífens)
  };
  
  return (
    <div >
    <Header />


    {/* <Helmet>
      <title>Pesquisa de produtos - Loja Mediewal</title>
      <meta name="description" content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos." />
    </Helmet> */}

            <div className={styles.SearchResultsCotainer}>
              <ul
             
                className={styles.ul}
              >
                {searchResults.length === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      display: "flex",
                      flexDirection: "column",
                      top: "15rem",
                      left: "35rem",
                    }}
                  >
                    <img
                      src="https://i.imgur.com/ocoLP28.png"
                      alt="icone de produto indisponivel"
                    />
                    <span>
                      O Produto que Você Procura Não Está Disponível no
                      momento.
                    </span>
                  </div>
                )}
                {searchResults.map((product) => (
                  <li key={product._id} className={styles.li}>
                    <Link
                      href={`/products/${removeAccents(product.name)}/${product._id}`}
                      style={{
                    
                        color: "black",
                        textDecoration: "none",
                        position:"relative"
                      }}
                      className={styles.Link}
                    >
                      <div className={styles.IconToggle}>
                      <IconToggle productId={product._id} />

                      </div>
                      <img
                        src={product.variations[0].urls[0]}
                        alt={product.name}
                    
                        className={styles.SearchResultsCotainer__image}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginLeft: "1rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1rem",
                            fontWeight: "700",
                            fontFamily: "poppins, sans-serif",
                          }}
                        >
                          R${" "}
                          {product.variations[0].sizes[0].price &&
                            product.variations[0].sizes[0].price.toFixed(2)}
                        </span>

                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            width: "15vw",
                            color: "rgb(114, 114, 114)",
                            fontSize: ".8rem",
                          }}
                        >
                          {product.name}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "2rem",
                }}
                className={styles.Pagination}
              >
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(totalProducts / 10)}
                    variant="outlined"
                    color="primary"
                    size="large"
                    page={currentPage}
                    onChange={handlePageChange}
                  />
                </Stack>
              </div>

        
    
    </div>
    <Navbar />
  </div>
  );
};

export default SearchResults;
