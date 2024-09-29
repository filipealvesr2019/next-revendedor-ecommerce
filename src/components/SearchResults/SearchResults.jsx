"use client";
import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import Header from "./Header";
import IconToggle from "./IconToggle";
import styles from "./SearchResults.module.css"
import colorMap from "./colorMap";
import Navbar from "./Navbar";
import { useConfig } from "../context/ConfigContext";
import { logPageView } from "../../analytics";
import { Helmet } from "react-helmet";
const SearchResults = () => {
  const { query } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({
    color: "",
    size: "",
    priceRange: "",
  });
  const [showCategory, setShowCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [mixedProducts, setMixedProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);

  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState({});
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [uniqueSizes, setUniqueSizes] = useState(new Set());
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(originalProducts);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const { apiUrl } = useConfig();
  const location = useLocation();

  useEffect(() => {
    logPageView();
  }, [location]);
  useEffect(() => {
    setColors(Object.keys(colorMap)); // Lista de todas as cores do colorMap
  }, []);

  const getSizesForColor = (products, color) => {
    const sizesSet = new Set();
    products.forEach((product) => {
      if (
        !color ||
        product.variations.some((variation) => variation.color === color)
      ) {
        product.variations.forEach((variation) => {
          variation.sizes.forEach((sizeObj) => {
            sizesSet.add(sizeObj.size);
          });
        });
      }
    });
    return Array.from(sizesSet);
  };

  // Função para obter o preço de um tamanho específico
  const getPriceForSize = (product, color, size) => {
    const variation = product.variations.find(
      (variation) => variation.color === color
    );
    if (variation) {
      const sizeObj = variation.sizes.find((item) => item.size === size);
      return sizeObj ? sizeObj.price : 0;
    }
    return 0;
  };

  // UseEffect para inicializar os tamanhos disponíveis com base na primeira cor

  useEffect(() => {
    if (originalProducts.length > 0) {
      const firstColor = originalProducts[0].variations[0].color;
      const sizesArray = getSizesForColor(originalProducts, firstColor);
      setAvailableSizes(sizesArray);
    }
    setFilteredProducts(originalProducts);
  }, [originalProducts]);

  useEffect(() => {
    filterProducts();
  }, [selectedColor, selectedSize, selectedSubcategory]);

  const filterProducts = () => {
    let filtered = originalProducts;

    if (selectedColor) {
      filtered = filtered.filter((product) =>
        product.variations.some(
          (variation) => variation.color === selectedColor
        )
      );
    }

    if (selectedSize) {
      filtered = filtered.filter((product) =>
        product.variations.some((variation) =>
          variation.sizes.some((sizeObj) => sizeObj.size === selectedSize)
        )
      );
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(
        (product) => product.subcategory === selectedSubcategory
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSubcategoryClick = (subcategory) => {
    if (subcategory === selectedSubcategory) {
      setSelectedSubcategory(null);
      setFilteredProducts(originalProducts);
    } else {
      setSelectedSubcategory(subcategory);
    }
  };

  const handleColorClick = (color) => {
    if (color === selectedColor) {
      setSelectedColor(null);
      setFilteredProducts(originalProducts);
      if (originalProducts.length > 0) {
        const firstColor = originalProducts[0].variations[0].color;
        setAvailableSizes(getSizesForColor(originalProducts, firstColor));
      }
    } else {
      setSelectedColor(color);
    }
  };

  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const fetchMixedProducts = async (page, filters) => {
    setLoading(true); // Define o estado de carregamento como true antes de fazer a chamada à API

    try {
      const queryString = Object.entries(filters)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      const response = await fetch(
        `${apiUrl}/api/categories/${showCategory}/mixedProducts?page=${page}&${queryString}`
      );
      const data = await response.json();
      setMixedProducts(data.mixedProducts);
      setTotalPages(data.totalPages);
      setLoading(false); // Define o estado de carregamento como true antes de fazer a chamada à API
    } catch (error) {
      console.error("Erro ao obter produtos misturados:", error);
    }
  };

  useEffect(() => {
    setLoading(true); // Define o estado de carregamento como true antes de fazer a chamada à API

    const fetchSubcategories = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/subcategories/${showCategory}`
        );
        const data = await response.json();
        setSubcategories(data);
        setLoading(false); // Define o estado de carregamento como true antes de fazer a chamada à API
      } catch (error) {
        console.error("Erro ao obter subcategorias:", error);
      }
    };

    const fetchFilters = async () => {
      setLoading(true);

      try {
        const colorsResponse = await fetch(
          `${apiUrl}/api/categories/${showCategory}/colors`
        );
        const sizesResponse = await fetch(
          `${apiUrl}/api/categories/${showCategory}/sizes`
        );
        const priceResponse = await fetch(
          `${apiUrl}/api/categories/${showCategory}/priceRanges`
        );
        const colorsData = await colorsResponse.json();
        const sizesData = await sizesResponse.json();
        const priceData = await priceResponse.json();

        setColors(colorsData);
        setSizes(sizesData);
        setPriceRanges(priceData);
        setLoading(false);

        // Atualizar o conjunto único de tamanhos com base nos dados filtrados
        const allSizes = sizesData.reduce((acc, size) => {
          size.split(",").forEach((s) => acc.add(s.trim()));
          return acc;
        }, new Set());
        setUniqueSizes(allSizes);
      } catch (error) {
        console.error("Erro ao obter opções de filtros:", error);
      }
    };

    const fetchOriginalProducts = async () => {
      try {
        // await new Promise((resolve) => setTimeout(resolve, 1000));

        // Alteração na chamada de API para obter produtos misturados específicos
        const response = await fetch(
          `${apiUrl}/api/categories/${showCategory}/mixedProducts`
        );
        const data = await response.json();
        setOriginalProducts(data.mixedProducts);
        setLoading(false); // Define o estado de carregamento como true antes de fazer a chamada à API
      } catch (error) {
        console.error("Erro ao obter produtos misturados:", error);
      }
    };

    const initialFavorites = {};
    originalProducts.forEach((product) => {
      initialFavorites[product._id] = product.isFavorite || false;
    });
    setFavorites(initialFavorites);

    fetchSubcategories();
    fetchMixedProducts(currentPage, {});
    fetchFilters();
    fetchOriginalProducts();
  }, [showCategory, currentPage]);

  const handleFilterClick = async (filterType, value) => {
    let filteredProducts = originalProducts;

    if (filterType === "size") {
      filteredProducts = originalProducts.filter((product) =>
        product.variations.some((variation) =>
          variation.sizes.some((sizeObj) => sizeObj.size === value)
        )
      );
      setSelectedSize(value); // Atualiza o tamanho selecionado no estado
    } else if (filterType === "color") {
      filteredProducts = originalProducts.filter((product) =>
        product.variations.some((variation) => variation.color === value)
      );
      setSelectedColor(value); // Atualiza a cor selecionada no estado
    } else if (filterType === "price") {
      // Aqui, filtre os produtos com base no intervalo de preços selecionado
      const [minPrice, maxPrice] = value.split("-").map(Number);
      filteredProducts = originalProducts.filter((product) => {
        const productPrice = Number(product.variations[0].sizes[0].price);
        return productPrice >= minPrice && productPrice <= maxPrice;
      });
    }

    setFilteredProducts(filteredProducts);
    setTotalPages(1); // Atualiza o número total de páginas para 1, uma vez que os produtos filtrados serão exibidos em uma única página
  };

  const handleFavoriteClick = (productId) => {
    setMixedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === productId
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      )
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        openFilterModal
      ) {
        setOpenFilterModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openFilterModal]);

  const handleOpenModal = () => {
    handleClickOpenModal();
  };

  const handleClickOpenModal = () => {
    setOpenFilterModal(true);
  };

  const handleClickCloseModal = () => {
    setOpenFilterModal(false);
  };

  const [switchContent, setSwitchContent] = useState(true);
  const handleChangeContent = () => {
    setSwitchContent(!switchContent);
  };
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/search/product?searchQuery=${query}&page=${currentPage}&color=${selectedFilters.color}&size=${selectedFilters.size}&priceRange=${selectedFilters.priceRange}`
        );
        const data = await response.json();
        console.log("category from server:", data.products[0].category);
        setSearchResults(data.products);
        setTotalProducts(data.totalProducts);
        setShowCategory(data.products[0].category);
      } catch (error) {
        console.error("Erro ao buscar resultados de pesquisa:", error);
      }
    };

    fetchSearchResults();
  }, [
    query,
    currentPage,
    selectedFilters.color,
    selectedFilters.size,
    selectedFilters.priceRange,
  ]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };
// Função para remover acentos
// Função para remover acentos
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


      <Helmet>
        <title>Pesquisa de produtos - Loja Mediewal</title>
        <meta name="description" content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos." />
      </Helmet>

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
                        to={`/products/${removeAccents(product.name)}/${product._id}`}
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