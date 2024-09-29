"use client" 
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';


import styles from "./page.module.css";

import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import axios from "axios";
import CustomPagination from "@/components/Categories/Pagination/CustomPagination";
import Header from "@/components/Header/Header";
import IconToggle from "@/components/IconToggle/IconToggle";
import Navbar from "@/components/Navbar/Navbar";
import ProductList from "@/components/ProductList/ProductList";
import { useConfig } from "../../../context/ConfigContext";
import CategorySubcategoriesSkeleton from "@/components/Skeletons/CategorySubcategoriesSkeleton";
import Link from "next/link";
// export const metadata = {
//     title: 'Home - Loja Mediewal', // Define o título da página
//     description: 'Veja as últimas novidades em nossa loja, com uma seleção de produtos novos.', // Descrição da página
//     icons: {
//       icon: '/favicon.svg', // Define o favicon
//     },
//   };
const CategoriesComponent = ({ category }) => {
  
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoriesData, setSubcategoriesData] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(-1); // -1 indica que nenhuma imagem está sendo hoverada
  const [mixedProducts, setMixedProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState({});
  const [colors, setColors] = useState([]);
  const [colorMap, setColorMap] = useState([]);

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
  const [doubleBorder, setDoubleBorder] = useState(null); // Alterar para índice
  const [hideProducts, setHideProducts] = useState(false); // Alterar para índice
  const [priceRange, setPriceRange] = useState([]);
  const { apiUrl } = useConfig();
  

  
  const getColors = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/user/colors`);
      const colorsArray = response.data.colors;
      const colorsObject = colorsArray.reduce((acc, color) => {
        acc[color.name] = color.color; // Mapeia o name da cor para o valor hexadecimal
        return acc;
      }, {});
      setColorMap(colorsObject);
    } catch (error) {
      console.error("Erro ao obter cores", error);
    }
  };
  
  useEffect(() => {
    getColors(); // Lista de todas as cores do colorMap
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
      console.log("Filtrando produtos por tamanho:", selectedSize);
      filtered = filtered.filter((product) =>
        product.variations.some((variation) =>
          variation.sizes.some((sizeObj) => sizeObj.size === selectedSize)
        )
      );
    }

    if (selectedSubcategory) {
      console.log("Filtrando produtos por subcategoria:", selectedSubcategory);
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

  const handlePriceRangeClick = (minPrice, maxPrice) => {
    setSelectedPrice({ minPrice, maxPrice });
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
    updateHideProducts(selectedSize, color);
  };

  const handleSizeClick = (size) => {
    setSelectedSize(size);
    updateHideProducts(size, selectedColor);
  };


  
  const updateHideProducts = (size, color) => {
    if (size && !color) {
      setHideProducts(true); // Mostrar ProductList quando apenas o tamanho é selecionado
    } else if (size && color) {
      setHideProducts(false); // Mostrar produtos misturados quando tamanho e cor são selecionados
    } else {
      setHideProducts(false); // Mostrar produtos misturados por padrão
    }
  };

  const fetchMixedProducts = async (page, filters) => {
    setLoading(true);
    try {
      // await new Promise(resolve => setTimeout(resolve, 20000));

      const queryString = Object.entries(filters)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      const response = await fetch(
        `${apiUrl}/api/categories/${category}/mixedProducts?page=${page}&${queryString}`
      );
      const data = await response.json();
      setMixedProducts(data.mixedProducts);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao obter produtos misturados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSubcategoriesData = async () => {
      setLoading(true);
      try {
        // await new Promise(resolve => setTimeout(resolve, 20000));

        const response = await fetch(
          `${apiUrl}/api/categories/${category}/${selectedSubcategory}`
        );
        const data = await response.json();
        setSubcategoriesData(data.subcategoryProducts);
        setLoading(false);
      } catch (error) {
        setLoading(false);

        console.error("Erro ao obter subcategorias:", error);
      }
    };

    fetchSubcategoriesData();
  }, [category, selectedSubcategory]);

  useEffect(() => {
    const fetchPriceRangeData = async () => {
      setLoading(true);

      if (selectedPrice) {
        try {
          // await new Promise(resolve => setTimeout(resolve, 20000));

          const { minPrice, maxPrice } = selectedPrice;

          const response = await fetch(
            `${apiUrl}/api/category/${category}/priceRange?minPrice=${minPrice}&maxPrice=${maxPrice}`
          );
          const data = await response.json();
          setPriceRange(data.products || []);
          setLoading(false);
        } catch (error) {
          setLoading(false);

          console.error("Erro ao obter subcategorias:", error);
        }
      }
    };

    fetchPriceRangeData();
  }, [category, selectedPrice]);

  useEffect(() => {
    setLoading(true); // Define o estado de carregamento como true antes de fazer a chamada à API

    const fetchSubcategories = async () => {
      try {
        // await new Promise(resolve => setTimeout(resolve, 20000));

        const response = await fetch(
          `${apiUrl}/api/subcategories/${category}`
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
        // await new Promise((resolve) => setTimeout(resolve, 10000));

        const colorsResponse = await fetch(
          `${apiUrl}/api/categories/${category}/colors`
        );
        const sizesResponse = await fetch(
          `${apiUrl}/api/categories/${category}/sizes`
        );
        const priceResponse = await fetch(
          `${apiUrl}/api/categories/${category}/priceRanges`
        );

        const colorsData = await colorsResponse.json();
        const sizesData = await sizesResponse.json();
        const priceData = await priceResponse.json();

        setColors(colorsData);
        setSizes(sizesData);
        setPriceRanges(priceData);

        // Atualizar o conjunto único de tamanhos com base nos dados filtrados
        const allSizes = sizesData.reduce((acc, size) => {
          size.split(",").forEach((s) => acc.add(s.trim()));
          return acc;
        }, new Set());
        setUniqueSizes(allSizes);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao obter opções de filtros:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchOriginalProducts = async () => {
      setLoading(true); // Define loading como falso após obter os dados

      try {
        // await new Promise((resolve) => setTimeout(resolve, 10000));

        // Alteração na chamada de API para obter produtos misturados específicos
        const response = await fetch(
          `${apiUrl}/api/categories/${category}/mixedProducts`
        );
        setLoading(false); // Define o estado de carregamento como true antes de fazer a chamada à API

        const data = await response.json();
        setOriginalProducts(data.mixedProducts);
      } catch (error) {
        setLoading(false); // Define loading como falso após obter os dados

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
  }, [category, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterClick = async (filterType, value) => {
    let filteredProducts = originalProducts;

    if (filterType === "size") {
      console.log("Filtrando produtos por tamanho:", value);
      filteredProducts = originalProducts.filter((product) =>
        product.variations.some((variation) =>
          variation.sizes.some((sizeObj) => sizeObj.size === value)
        )
      );
      setSelectedSize(value); // Atualiza o tamanho selecionado no estado
    } else if (filterType === "color") {
      setHideProducts(true);
      console.log("Filtrando produtos por cor:", value);
      filteredProducts = originalProducts.filter((product) =>
        product.variations.some((variation) => variation.color === value)
      );
      setSelectedColor(value); // Atualiza a cor selecionada no estado
    } else if (filterType === "price") {
      console.log("Filtrando produtos por faixa de preço:", value);
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

  const filteredProductsContent = filteredProducts.length;
  const [content, setContent] = useState("1");

       // Função para remover acentos
const removeAccents = (name) => {
  return name
  .normalize("NFD") // Normaliza a string para decompor caracteres acentuados
  .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (acentos)
  .toLowerCase() // Converte para letras minúsculas
  .replace(/\s+/g, "-") // Substitui espaços por hífens
  .replace(/[^\w\-]+/g, ""); // Remove caracteres não alfanuméricos (exceto hífens)
};
  const renderContent = () => {
    switch (content) {
      case "1":
        return (
          <>
            {hideProducts === false ? (
              <div className={styles.ProductsDesktopContainer}>
                {mixedProducts.length === 0 && (
                  <div
             
                    className={styles.OutOfStock}
                  >
                    <img
                      src="https://i.imgur.com/ocoLP28.png"
                      alt="icone de carrinho vazio"
                      className={styles.OutOfStockIMG}
                      loading="lazy" // Adiciona lazy loading
                      

                    />
                    <span  className={styles.OutOfStockSpan}>
                      O Produto que Você Procura Não Está Disponível no momento.
                    </span>
                  </div>
                )}
                <ul className={styles.ProductsContainer}>
                  {mixedProducts.map((product, index) => {
                    const selectedColorVariation = selectedColor
                      ? product.variations.find(
                          (variation) => variation.color === selectedColor
                        )
                      : product.variations[0];

                    const hasPhoto =
                      selectedColorVariation &&
                      selectedColorVariation.urls &&
                      selectedColorVariation.urls.length > 0;

                    if (!hasPhoto) {
                      return null;
                    }

                    const displayedPrice = selectedSize
                      ? getPriceForSize(product, selectedColor, selectedSize)
                      : selectedColorVariation
                      ? selectedColorVariation.sizes[0].price
                      : product.variations[0].sizes[0].price;

                    const size =
                      selectedSize || selectedColorVariation.sizes[0].name;

                    const queryParams = new URLSearchParams();
                    queryParams.append(
                      "selectedImageFromCategory",
                      selectedColorVariation.urls[0]
                    );
                    queryParams.append(
                      "selectedColorFromCategory",
                      selectedColor
                    );
                    queryParams.append(
                      "selectedPriceFromCategory",
                      displayedPrice
                    );
                    queryParams.append("selectedSizeFromCategory", size);

                    let imageUrl;

                    switch (true) {
                      case selectedColorVariation.urls.length > 1:
                        imageUrl =
                          hoveredIndex === index
                            ? selectedColorVariation.urls[1]
                            : selectedColorVariation.urls[0];
                        break;
                      default:
                        imageUrl = selectedColorVariation.urls[0];
                    }

                    return (
                      <>
                        <li
                          key={product._id}
                          className={styles.ProductsContainer__li}
                        >
                          <Link
                            href={{
                              pathname: `/products/${removeAccents(product.name)}/${product._id}`,
                              search: `?${queryParams.toString()}`,
                            }}
                            style={{ color: "black", textDecoration: "none" }}
                          >
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className={styles.ProductsContainer__image}
                              onMouseEnter={() =>
                                selectedColorVariation.urls.length > 1 &&
                                setHoveredIndex(index)
                              }
                              onMouseLeave={() =>
                                selectedColorVariation.urls.length > 1 &&
                                setHoveredIndex(-1)
                              }
                              loading="lazy" // Adiciona lazy loading

                            />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                marginBottom: "4rem",
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
                                {Number(
                                  displayedPrice ||
                                    product.price ||
                                    product.variations[0].sizes[0].price
                                )
                                  .toFixed(2)
                                  .padStart(5, "0")}
                              </span>
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  width: "15vw",
                                  color: "rgb(114, 114, 114)",
                                  fontSize: ".9rem",
                                  fontFamily: 'Poppins, sans-serif'
                                }}
                              >
                                {product.name}
                              </span>
                            </div>
                          </Link>
                          <div
                            style={{
                              position: "absolute",
                              top: "-5%",
                              right: "0",
                              zIndex: 5,
                              marginBottom: "5rem",
                              width: "3rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconToggle
                              productId={product._id}
                              isFavorite={favorites[product._id]}
                            />
                          </div>
                        </li>
                      </>
                    );
                  })}
                </ul>

                {mixedProducts.length > 0 && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "2rem",
                      }}
                      className={styles.DestopCustomPagination}
                    >
                      <CustomPagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onChangePage={handlePageChange}
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <ProductList products={filteredProducts} />
            )}
          </>
        );

      case "2":
        return (
          <>
            <div>
              {loading ? (
                <p>Carregando...</p>
              ) : (
                <div className={styles.subcategoriesDataContainer}>
                  {subcategoriesData.map((product) => (
                    <div key={product._id}>
                      <div
                        className={
                          styles.subcategoriesDataContainer__productCard
                        }
                      >
                        <img
                          src={product.variations[0].urls[0]}
                          alt={product.name}
                          className={styles.subcategoriesDataContainer__image}
                          loading="lazy" // Adiciona lazy loading

                        />
                        <p className={styles.subcategoriesDataContainer__price}>
                           R$
                          {product.variations[0].sizes[0].price.toFixed(2)}
                        </p>
                        <p
                          className={
                            styles.subcategoriesDataContainer__productName
                          }
                        >
                          {" "}
                          {product.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      case "3":
        return (
          <>
            <div>
              {loading ? (
                <p>Carregando...</p>
              ) : (
                <div>
                  <div className={styles.priceContainer}>
                    {priceRange.map((product) => (
                      <div key={product._id}>
                        <div className={styles.priceContainer__productcard}>
                          <img
                            src={product.variations[0].urls[0]}
                            alt={product.name}
                            className={styles.priceContainer__image}
                            loading="lazy" // Adiciona lazy loading

                          />
                          <p className={styles.priceContainer__price}>
                            R$
                            {product.variations[0].sizes[0].price.toFixed(2)}
                          </p>

                          <h3 className={styles.priceContainer__productName}>
                            {product.name}
                          </h3>

                          {/* Renderização adicional conforme necessário */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };
  return (
    <div
      style={{
        display: "flex",
        marginTop: "14rem",
      }}
    >
      <div style={{ zIndex: "6" }}>
        <Header />
      </div>

      {/* <Helmet>
          <title>Categorias - Loja Mediewal</title>
          <meta
            name="description"
            content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
          />
        </Helmet> */}
      {loading ? (
        <div
          style={{
            display: "flex",
            margin: "0 auto",
            marginTop: "-2rem",
          }}
        >
          <CategorySubcategoriesSkeleton />;
        </div>
      ) : (
        <>
          <div
            style={{
              marginLeft: "5rem",
              marginRight: "2rem",
              marginTop: "-2rem",
            }}
          >
            <div className={styles.DesktopFilter}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginBottom: "2rem",
                  fontFamily: "Montserrat, arial, sans-serif",
                  fontWeight: "400",
                  fontSize: "1.3rem",
                  color: "rgb(52, 52, 54)",
                }}
              >
                Filtros
              </div>
            </div>
            <div className={styles.Filter}>
              <div
                style={{
                  width: "90vw",
                  borderBottom: "1px solid gray",
                  top: "7rem",
                  position: "absolute",
                  left: "10px",
                }}
                className={styles.FilterContainer}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyItems: "center",
                    fontFamily: "Montserrat, arial, sans-serif",
                    fontWeight: "400",
                    fontSize: "1.3rem",
                    color: "rgb(52, 52, 54)",
                    cursor: "pointer",
                    marginLeft: "2rem",
                  }}
                  onClick={handleOpenModal}
                >
                  <FilterListIcon />
                  Filtros
                </div>
              </div>

              <div className={styles.MobileFilter}></div>
              <div>
                {openFilterModal && (
                  <div className={styles.FilterModal}>
                    <div
                      ref={modalRef}
                      className={styles.FilterModalContent}
                      style={{
                        overflowX: "auto",
                        maxHeight: "100vh",
                      }}
                    >
                      <span
                        className={styles.FilterClose}
                        onClick={handleClickCloseModal}
                      >
                        <CloseIcon />
                      </span>
                      <p
                        style={{
                          fontFamily: "Montserrat, arial, sans-serif",
                          fontWeight: "600",
                          fontSize: "1.2rem",
                          color: "rgb(52, 52, 54)",
                        }}
                      >
                        Categorias
                      </p>
                      <div onClick={handleClickCloseModal}>
                        <ul style={{ listStyle: "none", marginBottom: "3rem" }}>
                          {subcategories.map((subcategory, index) => (
                            <li
                              key={index}
                              className={styles.myLinks}
                              onClick={() => {
                                handleSubcategoryClick(subcategory),
                                  setContent("2");
                              }}
                            >
                              {subcategory}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ marginBottom: "3rem" }}>
                        <h3
                          style={{
                            fontFamily: "Montserrat, arial, sans-serif",
                            fontWeight: "600",
                            fontSize: "1.2rem",
                            color: "rgb(52, 52, 54)",
                          }}
                        >
                          Cores
                        </h3>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            width: "70vw",
                          }}
                        >
                          {colors.map((color, index) => (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyItems: "center",
                                marginTop: "1rem",
                                position: "relative",
                              }}
                              onClick={() => {
                                handleColorClick(color);
                                // handleSelectBorder(index);
                              }}
                            >
                              <div
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  backgroundColor: colorMap[color],
                                  marginRight: "10px",
                                  border: `1px solid ${
                                    doubleBorder === index
                                      ? "transparent"
                                      : "gray"
                                  }`,
                                  position: "relative",
                                }}
                              ></div>
                              {doubleBorder === index && (
                                <div
                                  style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius: "50%",
                                    border: `2px solid ${colorMap[color]}`, // Usando a cor selecionada para a borda
                                    position: "absolute",
                                    top: "-5px",
                                    left: "-5px",
                                  }}
                                ></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "Montserrat, arial, sans-serif",
                          fontWeight: "600",
                          fontSize: "1.2rem",
                          color: "rgb(52, 52, 54)",
                        }}
                      >
                        Tamanhos
                      </span>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",

                          width: "70vw",
                        }}
                        className={styles.repeat}
                      >
                        {Array.from(uniqueSizes).map((size, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              handleFilterClick("size", size);
                            }}
                          >
                            <button
                              style={{
                                borderRadius: "20px",
                                width: "40px",
                                height: "40px",
                                border: "1px solid rgb(114, 114, 114)",
                                backgroundColor:
                                  selectedSize === size
                                    ? "#333"
                                    : "rgb(255, 255, 255)",
                                color:
                                  selectedSize === size ? "white" : "black",
                                marginLeft: "8px",
                                marginTop: "8px",
                                cursor: "pointer",
                                marginBottom: ".5rem",
                              }}
                              onClick={() => handleSizeClick(size)}
                            >
                              <span style={{ fontSize: ".8rem" }}> {size}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                      <h3
                        style={{
                          fontFamily: "Montserrat, arial, sans-serif",
                          fontWeight: "600",
                          fontSize: "1.2rem",
                          color: "rgb(52, 52, 54)",
                          marginTop: "2rem",
                        }}
                      >
                        Faixas de Preços
                      </h3>
                      <div
                        onClick={() => {
                          handlePriceRangeClick(0, 50), setContent("3");
                        }}
                        style={{
                          cursor: "pointer",
                          fontFamily: "Montserrat, arial, sans-serif",
                          fontWeight: selectedPrice === "0-50" ? "600" : "400",
                          fontSize:
                            selectedPrice === "0-50" ? "1.1rem" : "1rem",
                          color:
                            selectedPrice === "0-50"
                              ? "rgb(52, 52, 54)"
                              : "rgb(52, 52, 54)",
                          margin: "0.5rem",
                        }}
                      >
                        R$5 - R$50
                      </div>
                      <div
                        onClick={() => {
                          handlePriceRangeClick(50, 100), setContent("3");
                        }}
                        style={{
                          cursor: "pointer",
                          fontFamily: "Montserrat, arial, sans-serif",
                          fontWeight:
                            selectedPrice === "50-100" ? "600" : "400",
                          fontSize:
                            selectedPrice === "50-100" ? "1.1rem" : "1rem",
                          color:
                            selectedPrice === "50-100"
                              ? "rgb(52, 52, 54)"
                              : "rgb(52, 52, 54)",
                          margin: "0.5rem",
                        }}
                      >
                        R$50 - R$100
                      </div>
                      <div
                        onClick={() => {
                          handlePriceRangeClick(100, 200), setContent("3");
                        }}
                        style={{
                          cursor: "pointer",
                          fontFamily: "Montserrat, arial, sans-serif",
                          fontWeight:
                            selectedPrice === "100-200" ? "600" : "400",
                          fontSize:
                            selectedPrice === "100-200" ? "1.1rem" : "1rem",
                          color:
                            selectedPrice === "100-200"
                              ? "rgb(52, 52, 54)"
                              : "rgb(52, 52, 54)",
                          margin: "0.5rem",
                        }}
                      >
                        R$100 - R$200
                      </div>
                      <div
                        onClick={() => {
                          handlePriceRangeClick(200, 500), setContent("3");
                        }}
                        style={{
                          cursor: "pointer",
                          fontFamily: "Montserrat, arial, sans-serif",
                          fontWeight: selectedPrice === "200-" ? "600" : "400",
                          fontSize:
                            selectedPrice === "200-" ? "1.1rem" : "1rem",
                          color:
                            selectedPrice === "200-"
                              ? "rgb(52, 52, 54)"
                              : "rgb(52, 52, 54)",
                          margin: "0.5rem",
                        }}
                      >
                        R$200 ou mais
                      </div>
                      <div className={styles.filteredQuantity}>
                        <button
                          onClick={handleClickCloseModal}
                          className={styles.filteredQuantity__button}
                        >
                          {" "}
                          {filteredProductsContent} resultados{" "}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.DesktopFilter}>
              <p
                style={{
                  fontFamily: "Montserrat, arial, sans-serif",
                  fontWeight: "600",
                  fontSize: "1.2rem",
                  color: "rgb(52, 52, 54)",
                }}
              >
                Categorias
              </p>
              <div onClick={handleClickCloseModal}>
                <ul
                  style={{
                    listStyle: "none",
                    marginBottom: "3rem",
                    cursor: "pointer",
                  }}
                >
                  {subcategories.map((subcategory, index) => (
                    <li
                      key={index}
                      className={styles.myLinks}
                      onClick={() => {
                        handleSubcategoryClick(subcategory), setContent("2");
                      }}
                    >
                      {subcategory}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: "3rem" }}>
                <h3 className={styles.Cores}>Cores</h3>

                {colors.map((color, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyItems: "center",
                      marginTop: "1rem",
                      cursor: "pointer",
                    }}
                    className={styles.colorContainer}
                    onClick={() => {
                      handleColorClick(color.name); // Usar o name da cor
                      // handleSelectBorder(index);
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: colorMap[color], // Verifique se o valor é válido
                        marginRight: "10px",
                        border: "1px solid rgba(0, 0, 0, 0.05)",
                      }}
                    ></div>
                    <div
                      style={{
                        cursor: "pointer",
                        fontWeight: selectedColor === color ? "600" : "400",
                        fontSize: selectedColor === color ? "1.1rem" : "1rem",
                        fontFamily: "poppins,  sans-serif",
                      }}
                      className={styles.colorContainer__color}
                    >
                      {color}
                    </div>
                  </div>
                ))}

                <h3
                  style={{
                    fontFamily: "poppins, sans-serif",
                    fontWeight: "600",
                    fontSize: "1.2rem",
                    color: "rgb(52, 52, 54)",
                  }}
                >
                  Tamanhos
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                  }}
                  className={styles.repeat}
                >
                  {Array.from(uniqueSizes).map((size, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        handleFilterClick("size", size), setContent("1");
                      }}
                    >
                      <button
                        style={{
                          borderRadius: "20px",
                          width: "40px",
                          height: "40px",
                          border: "1px solid rgb(114, 114, 114)",
                          backgroundColor:
                            selectedSize === size
                              ? "#333"
                              : "rgb(255, 255, 255)",
                          color: selectedSize === size ? "white" : "black",
                          marginLeft: "8px",
                          marginTop: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          handleSizeClick(size);
                        }}
                      >
                        <span style={{ fontSize: ".8rem" }}> {size}</span>
                      </button>
                    </div>
                  ))}
                </div>
                <h3
                  style={{
                    fontFamily: "Montserrat, arial, sans-serif",
                    fontWeight: "600",
                    fontSize: "1.2rem",
                    color: "rgb(52, 52, 54)",
                    marginTop: "2rem",
                  }}
                >
                  Faixas de Preços
                </h3>
                <div
                  onClick={() => {
                    handlePriceRangeClick(0, 50), setContent("3");
                  }}
                  style={{
                    cursor: "pointer",
                    fontFamily: "Montserrat, arial, sans-serif",
                    fontWeight: selectedPrice === "0-50" ? "600" : "400",
                    fontSize: selectedPrice === "0-50" ? "1.1rem" : "1rem",
                    color:
                      selectedPrice === "0-50"
                        ? "rgb(52, 52, 54)"
                        : "rgb(52, 52, 54)",
                    margin: "0.5rem",
                  }}
                >
                  R$5 - R$50
                </div>
                <div
                  onClick={() => {
                    handlePriceRangeClick(50, 100), setContent("3");
                  }}
                  style={{
                    cursor: "pointer",
                    fontFamily: "Montserrat, arial, sans-serif",
                    fontWeight: selectedPrice === "50-100" ? "600" : "400",
                    fontSize: selectedPrice === "50-100" ? "1.1rem" : "1rem",
                    color:
                      selectedPrice === "50-100"
                        ? "rgb(52, 52, 54)"
                        : "rgb(52, 52, 54)",
                    margin: "0.5rem",
                  }}
                >
                  R$50 - R$100
                </div>
                <div
                  onClick={() => {
                    handlePriceRangeClick(100, 200), setContent("3");
                  }}
                  style={{
                    cursor: "pointer",
                    fontFamily: "Montserrat, arial, sans-serif",
                    fontWeight: selectedPrice === "100-200" ? "600" : "400",
                    fontSize: selectedPrice === "100-200" ? "1.1rem" : "1rem",
                    color:
                      selectedPrice === "100-200"
                        ? "rgb(52, 52, 54)"
                        : "rgb(52, 52, 54)",
                    margin: "0.5rem",
                  }}
                >
                  R$100 - R$200
                </div>
                <div
                  onClick={() => {
                    handlePriceRangeClick(200, 500), setContent("3");
                  }}
                  style={{
                    cursor: "pointer",
                    fontFamily: "Montserrat, arial, sans-serif",
                    fontWeight: selectedPrice === "200-" ? "600" : "400",
                    fontSize: selectedPrice === "200-" ? "1.1rem" : "1rem",
                    color:
                      selectedPrice === "200-"
                        ? "rgb(52, 52, 54)"
                        : "rgb(52, 52, 54)",
                    margin: "0.5rem",
                  }}
                >
                  R$200 ou mais
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>{renderContent()}</div>
          </div>
        </>
      )}

      <Navbar />
    </div>
  );
};

export default CategoriesComponent;
