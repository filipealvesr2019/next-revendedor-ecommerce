"use client"
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import "./ProductDetails.css";


import styles from "./ProductDetails.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

import { TrendingUpOutlined,  } from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";
import { width } from "@mui/system";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";

import { useAuth } from "../../../context/AuthContext";
import FreteSelect from "../Frete/FreteSelect";
import { useCart } from "../../../context/CartContext";
import { useConfig } from "../../../context/ConfigContext";
import Header from "../Header/Header";
import Navbar from "../Navbar/Navbar";
import ZoomInComponent from '../ZoomIn/ZoomInComponent'
import CartSidebar from "../cartSidebar/CartSidebar";
import { useSwipeable } from "react-swipeable";
const ProductDetails = ({productId, name}) => {
  const [product, setProduct] = useState({ variations: [] });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sizesFromDatabase, setSizesFromDatabase] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [openCartModal, setOpenCartModal] = useState(false);
  const modalRef = useRef(null);
  const [isColorAndSizeSelected, setIsColorAndSizeSelected] = useState(false);
  const [customer, setCustomer] = useState([]);
  const { cartItemCount, addToCart } = useCart();
  const userId = Cookies.get("userId"); // Obtenha o token do cookie
  const [openSecondCartModal, setOpenSecondCartModal] = useState(false);
  const credentials = Cookies.get("role"); // Obtenha as credenciais do cookie
  const [selectedColorImage, setSelectedColorImage] = useState("");
  const [showCartButton, setShowCartButton] = useState(false);
  const token = Cookies.get("token"); // Obtenha o token do cookie
  const [showBorder, setShowBorder] = useState(false); // Estado para controlar a borda
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedColorId, setSelectedColorId] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { logout, loggedIn } = useAuth(); // Obtendo o userId do contexto de autenticação
  const [changeUrlLink, setChangeUrlLink] = useState(0);
  const { apiUrl } = useConfig();

  console.log("Product ID:", productId);
  console.log("Product Name:", name);

  const hendleButtonDisabled = () => {
    setIsButtonDisabled(true);
  };

  const handleShowBorder = () => {
    setShowBorder(!showBorder);
  };

  const handleClickOpenButton = () => {
    setShowCartButton(true);
  };

  const handleClickCloseButton = () => {
    setShowCartButton(false);
  };

  const handleOpenButton = async () => {
    handleClickOpenButton();
  };

  const handleClickOpenModal = () => {
    setOpenCartModal(true);
  };

  const handleClickCloseModal = () => {
    setOpenCartModal(false);
  };

  //  modal do carrinho

  const handleClickOpenCartModal = () => {
    setOpenSecondCartModal(true);
  };

  const handleClickCloseCartModal = () => {
    setOpenSecondCartModal(false);
  };

  useEffect(() => {
    const userId = Cookies.get("userId");

    axios
      .get(`${apiUrl}/api/custumer/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setCustomer(response.data);
        if (!response.data || response.data.length === 0) {
          setShowCartButton(true);
          handleClickOpenModal();
        } else {
          setShowCartButton(false);
        }
        console.log("cus", response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      const encodedProductName = encodeURIComponent(name);

      try {
        const response = await axios.get(
          `${apiUrl}/api/product/${encodedProductName}/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.product) {
          const productData = response.data.product;

          // Defina a imagem da cor selecionada como a primeira imagem da primeira variação
          setSelectedColorImage(productData.variations[0]?.urls[0] || "");

          // Atualize o estado do produto com os dados recebidos
          setProduct(productData);

          // Verifique se há variações disponíveis
          if (productData.variations.length > 0) {
            // Atualize o estado com os tamanhos disponíveis para cada cor
            setSizesFromDatabase(
              productData.variations.map((variation) => ({
                color: variation.color,
                sizes: variation.sizes,
              }))
            );

            // Defina o primeiro tamanho como padrão
            setIsColorAndSizeSelected(true); // Marque como selecionado automaticamente

            // Defina o preço do primeiro tamanho como padrão
            setSelectedPrice(productData.variations[0]?.sizes[0]?.price || "");
          }
        }
      } catch (error) {
        console.error("Erro ao obter detalhes do produto:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        (openCartModal || openSecondCartModal)
      ) {
        setOpenCartModal(false);
        setOpenSecondCartModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openCartModal, openSecondCartModal]);

  // Função para lidar com o clique em miniaturas de cores
  // Função para lidar com o clique em miniaturas de cores
  const handleThumbnailClick = (colorIndex) => {
    // Definir o índice da cor selecionada
    setSelectedColorIndex(colorIndex);
    setCurrentImageIndex(colorIndex);
    setSelectedColorId(product.variations[colorIndex]._id); // Armazena o ID da cor selecionada
    setActiveColorIndex(colorIndex);
    setCurrentPage(0); // Reset the page to the first when the color changes

    setActiveUrlIndex(0); // Assuming we want to show the first image of the selected color

    // Verificar se a cor selecionada tem uma imagem associada
    const selectedVariation = product.variations[colorIndex];
    if (selectedVariation && selectedVariation.urls.length > 0) {
      // Atualizar a foto grande com a primeira imagem da cor selecionada
      setSelectedColorImage(selectedVariation.urls[0]);
    } else {
      // Se não houver imagem disponível para a cor selecionada, exibir uma mensagem de erro ou imagem padrão
      console.error(
        "Nenhuma imagem encontrada para a cor selecionada:",
        selectedVariation.color
      );
      // Definir uma imagem padrão ou exibir uma mensagem de erro
    }
  };

  const updateSizesForColor = (selectedColorIndex) => {
    const selectedVariation = product.variations[selectedColorIndex]; // Obtém a variação correspondente à cor selecionada

    if (selectedVariation) {
      // Atualiza o estado sizesFromDatabase com os tamanhos disponíveis para a cor selecionada
      setSizesFromDatabase(selectedVariation.sizes);
    } else {
      setSizesFromDatabase([]); // Se não houver variação correspondente, define os tamanhos como vazio
    }
    console.log("Sizes from database:", sizesFromDatabase);
    console.log("Selected color index:", selectedColorIndex);
  };
  const handleDotClick = (index) => {
    setSelectedColorIndex(index);
    setChangeUrlLink(0); // Reseta o índice da URL ao selecionar uma nova cor
  };

  const [imageIndices, setImageIndices] = useState({});

  // Inicializando os índices para cada cor no momento da montagem do componente
  useEffect(() => {
    const indices = {};
    product.variations.forEach((variation, index) => {
      indices[variation.color] = 0; // Inicializa todos os índices de URL como 0
    });
    setImageIndices(indices);
  }, [product]);

  const handleArrowClick = (direction) => {
    const currentColor = product.variations[selectedColorIndex]?.color;

    setImageIndices((prevIndices) => {
      const maxIndex = product.variations[selectedColorIndex].urls.length - 1;
      let newIndex = prevIndices[currentColor];

      if (direction === "prev") {
        newIndex = newIndex > 0 ? newIndex - 1 : maxIndex;
      } else {
        newIndex = newIndex < maxIndex ? newIndex + 1 : 0;
      }

      return { ...prevIndices, [currentColor]: newIndex };
    });
  };

  const handleAddToCartAndOpenModal = async () => {
    const productId = product._id;
    const selectedColor = product.variations[selectedColorIndex]?.color; // Obtém a cor selecionada, se existir
    const selectedSize = selectedSizeId;

    if (productId && selectedColor && selectedSize) {
      try {
        console.log(
          "Dados do produto:",
          productId,
          selectedColor,
          selectedSize
        );

        // Se o produto não existir no carrinho, adiciona um novo produto
        console.log("Adicionando novo produto ao carrinho.");
        const response = await axios.post(
          `${apiUrl}/api/add-to-cart/${userId}`,
          {
            productId: product._id,
            size: selectedSizeId,
            quantity: 1,
            image: selectedColorImage,
            price: selectedPrice,
            color: selectedColor,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Resposta ao adicionar novo produto:", response.data);

        // Adiciona ao carrinho apenas se for um novo produto
        addToCart();
        toast.success("Produto adicionado ao carrinho!");

        handleClickOpenCartModal();
      } catch (error) {
        if (loggedIn === false) {
          toast.error("Precisa fazer login pra adicionar algo ao carrinho!");
        } else {
          console.error("Erro ao adicionar produto ao carrinho:", error);
          toast.error("Produto com essa cor e tamanho indisponível.");
        }
      }
    } else {
      toast.error("Por favor, selecione uma cor e um tamanho.");
    }
  };

  // Atualize a função handleSizeSelection para atualizar o estado do tamanho selecionado
  const handleSizeSelection = (sizeId, price) => {
    setSelectedSize(sizeId); // Atualize o estado do tamanho selecionado
    setSelectedSizeId(sizeId); // Atualize o ID do tamanho selecionado
    setSelectedPrice(price); // Atualize o preço selecionado
  };

  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  const handlePrevColor = () => {
    setCurrentColorIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : product.variations.length - 1
    );
  };

  const handleNextColor = () => {
    setCurrentColorIndex((prevIndex) =>
      prevIndex < product.variations.length - 1 ? prevIndex + 1 : 0
    );
  };

  const max300And895 = useMediaQuery("(min-width:393px) and (max-width:853px)");

  const isSmallScreen = useMediaQuery("(max-width:699px)");

  const isMediumScreen = useMediaQuery("(min-width:700px)");

  const isLargeScreen = useMediaQuery("(min-width:1025px)");
  const isPortrait = useMediaQuery("(orientation: portrait)");

  const getbuttonStyleA = () => {
    if ((isSmallScreen, isPortrait)) {
      return {
        backgroundColor: "#5070E3",
        color: "white",
        border: "0",
        padding: ".8rem",
        borderRadius: "10px",
        fontWeight: "500",
        fontFamily: "poppins, sans-serif",
        cursor: "pointer",
        display: "flex",
        margin: "0 auto",
        marginTop: "3rem",
        width: "90vw",
        justifyContent: "center",
        fontSize: "1.3rem",
      };
    } else if ((max300And895, isPortrait)) {
      return {
        backgroundColor: "red",
        width: "10vw",
      };
    } else if (isMediumScreen) {
      return {
        backgroundColor: "#5070E3",
        color: "white",
        border: "none",
        padding: ".7rem",
        borderRadius: "8px",
        fontWeight: "500",
        fontFamily: "poppins, sans-serif",
        cursor: "pointer",
        display: "flex",
        margin: "0 auto",
        marginTop: "5rem",
        width: "20vw",
        justifyContent: "center",
        fontSize: "1rem",
      };
    } else if (isLargeScreen) {
      return {
        width: "13vw",
        height: "40vh",
      };
    } else {
      return {
        width: "13vw",
        height: "40vh",
      };
    }
  };

  const buttonStyleA = getbuttonStyleA();

  const getbuttonStyleB = () => {
    if (isSmallScreen) {
      return {
        backgroundColor: "red",
        color: "white",
        border: "none",
        padding: ".8rem",
        borderRadius: "8px",
        fontWeight: "500",
        fontFamily: "poppins, sans-serif",
        cursor: "pointer",
        display: "flex",
        margin: "0 auto",
        marginTop: "5rem",
        width: "80vw",
        justifyContent: "center",
        fontSize: "1.3rem",
      };
    } else if (isMediumScreen) {
      return {
        backgroundColor: "red",
        color: "white",
        border: "none",
        padding: ".8rem",
        borderRadius: "8px",
        fontWeight: "500",
        fontFamily: "poppins, sans-serif",
        cursor: "pointer",
        display: "flex",
        margin: "0 auto",
        marginTop: "5rem",
        width: "15vw",
        justifyContent: "center",
        fontSize: "1rem",
      };
    } else if (isLargeScreen) {
      return {
        width: "13vw",
        height: "40vh",
      };
    } else {
      return {
        width: "13vw",
        height: "40vh",
      };
    }
  };
  const buttonStyleB = getbuttonStyleB();

  const handleImageClick = () => {
    setChangeUrlLink((currentUrlIndex) => {
      // Incrementa o índice da URL
      let nextUrlIndex = currentUrlIndex + 1;
      // Verifica se o índice excede o número de URLs na variação atual
      if (nextUrlIndex >= product.variations[currentImageIndex].urls.length) {
        // Se desejar que ele retorne ao início automaticamente
        return 0;
        // Se não deseja ciclar automaticamente, mantenha no último
        // return currentUrlIndex;
      }
      return nextUrlIndex;
    });
  };

  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [activeUrlIndex, setActiveUrlIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const IMAGES_PER_PAGE = 3;

  const handleDotChangeClick = (variationIndex, urlIndex) => {
    setActiveColorIndex(variationIndex);
    setActiveUrlIndex(urlIndex);
    setCurrentPage(0); // Reset the page to the first when the color changes
  };

  const handleNextClick = () => {
    setActiveUrlIndex(
      (prevIndex) =>
        (prevIndex + 1) % product.variations[activeColorIndex].urls.length
    );
  };

  const handlePrevClick = () => {
    setActiveUrlIndex(
      (prevIndex) =>
        (prevIndex - 1 + product.variations[activeColorIndex].urls.length) %
        product.variations[activeColorIndex].urls.length
    );
  };

  const handlePageNext = () => {
    setCurrentPage((prevPage) =>
      Math.min(
        prevPage + 1,
        Math.floor(
          product.variations[activeColorIndex].urls.length / IMAGES_PER_PAGE
        )
      )
    );
  };

  const handlePagePrev = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const validVariations =
    product && product.variations && product.variations.length > 0;
  const validActiveColorIndex =
    validVariations && activeColorIndex < product.variations.length;
  const validUrls =
    validActiveColorIndex &&
    product.variations[activeColorIndex].urls &&
    product.variations[activeColorIndex].urls.length > 0;
  const validActiveUrlIndex =
    validUrls &&
    activeUrlIndex < product.variations[activeColorIndex].urls.length;

  const selectedImageUrl = validActiveUrlIndex
    ? product.variations[activeColorIndex].urls[activeUrlIndex]
    : "";

  const startIndex = currentPage * IMAGES_PER_PAGE;
  const endIndex = Math.min(
    startIndex + IMAGES_PER_PAGE,
    validUrls ? product.variations[activeColorIndex].urls.length : 0
  );
  const currentImages = validUrls
    ? product.variations[activeColorIndex].urls.slice(startIndex, endIndex)
    : [];

  // A URL canônica deve ser baseada no productId ou no name
  const canonicalUrl = `https://mediewal.com.br/products/${name}/${productId} `;

 console.log("canonicalUrl", canonicalUrl)
   // Lida com o swipe
   const handlers = useSwipeable({
    onSwipedLeft: () => handleArrowClick("next"),  // Passa para a próxima imagem
    onSwipedRight: () => handleArrowClick("prev"), // Volta para a imagem anterior
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,  // Para permitir que o swipe funcione no mouse em dispositivos de desktop também
  });

  return (
    <>
      <div className={styles.ProductDetailsContainer}>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ marginTop: "8rem" }}
        />
 
          {/* <Helmet>
            <title>{product.name || "Loja Mediewal"}</title>
            <meta
              name="description"
              content={
                product.description || "Somos a Mediewal, uma marca de roupas masculinas criada para quem quer se vestir bem e reinar no estilo. Inspirada no conceito de elegância  e confiança."
              }
            />

<link rel="canonical" href={canonicalUrl} />

          </Helmet> */}
          {/* O restante do seu componente */}
          {/* {product && (
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "http://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.imageUrl, // Altere para o URL da imagem do produto
      "description": product.description,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "BRL",
        "price": product.price, // Substitua pelo preço real
        "itemCondition": "http://schema.org/NewCondition",
        "availability": "http://schema.org/InStock"
      }
    })}
  </script>
)} */}

        <div style={{ position: "absolute", zIndex: "2" }}>
          <Header />
          {openSecondCartModal && (
            <div className={styles.secondCartModal}>
              <div ref={modalRef} className={styles.secondCartModalContent}>
                <div className={styles.secondCartCloseContainer}>
                  <div className={styles.IMGContent}>
                    <span>Pre visualização</span>
                  </div>
                  <span
                    className={styles.secondCartClose}
                    onClick={handleClickCloseCartModal}
                  >
                    &times;
                  </span>
                </div>

                <div className={styles.CartB}>
                  <CartSidebar />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.DesktopCarrosel}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div className={styles.containerImage}>
              <div
                className={styles.containerImage__miniature}
                style={{
                  marginTop:
                    validUrls &&
                    product.variations[activeColorIndex].urls.length >
                      IMAGES_PER_PAGE
                      ? "-1.5rem"
                      : "",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {validUrls &&
                    product.variations[activeColorIndex].urls.length >
                      IMAGES_PER_PAGE && (
                      <KeyboardArrowUpIcon
                        onClick={handlePagePrev}
                        disabled={currentPage === 0}
                      ></KeyboardArrowUpIcon>
                    )}
                </div>
                <div>
                  {currentImages.map((url, urlIndex) => (
                    <div key={startIndex + urlIndex}>
                      <img
                        src={url}
                        alt={`Image ${startIndex + urlIndex} for ${
                          product.variations[activeColorIndex].color
                        }`}
                        style={{
                          width: "6vw",
                          cursor: "pointer",
                          border:
                            startIndex + urlIndex === activeUrlIndex
                              ? "1px solid black"
                              : "none",
                        }}
                        onClick={() => setActiveUrlIndex(startIndex + urlIndex)}
                      />
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {validUrls &&
                    product.variations[activeColorIndex].urls.length >
                      IMAGES_PER_PAGE && (
                      <KeyboardArrowDownIcon
                        onClick={handlePageNext}
                        disabled={
                          endIndex >=
                          product.variations[activeColorIndex].urls.length
                        }
                      ></KeyboardArrowDownIcon>
                    )}
                </div>
              </div>
              {validActiveUrlIndex ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <ZoomInComponent selectedImageUrl={selectedImageUrl} />
                  <div style={{ position: "absolute", cursor: "pointer" }}>
                    <KeyboardArrowLeftIcon
                      onClick={handlePrevClick}
                    ></KeyboardArrowLeftIcon>
                    <KeyboardArrowRightIcon
                      onClick={handleNextClick}
                    ></KeyboardArrowRightIcon>
                  </div>
                  {/* <img
                  src={selectedImageUrl}
                  alt="Selected product"
                  style={{ width: "20vw", marginBottom: "2rem" }}
                /> */}
                </div>
              ) : (
                <p></p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.carroselMobile} {...handlers}>
      <div key={currentImageIndex} className="image-container">
        {product.variations[currentImageIndex] && (
          <img
            src={
              product.variations[selectedColorIndex]?.urls[
                imageIndices[product.variations[selectedColorIndex]?.color]
              ] || selectedImageUrl
            }
            alt={product.variations[selectedColorIndex]?.color}
            style={{ width: "100vw" }}
            onClick={() => {
              handleDotChangeClick(variationIndex, urlIndex);
            }}
          />
        )}

        <div className="navigation-arrows">
          <div className="arrow" onClick={() => handleArrowClick("prev")}>
            <img
              src="https://i.ibb.co/8MqhvFq/left-arrow.png"
              style={{ fontSize: "2rem", zIndex: "-8", color: "white" }}
            />
          </div>

          <div className="arrow" onClick={() => handleArrowClick("next")}>
            <img
              src="https://i.ibb.co/vDty4Gc/right-arrow-1.png"
              style={{ fontSize: "2rem", zIndex: "-7", color: "white" }}
            />
          </div>
        </div>

        <div className="dot-container">
          {product.variations?.map((variation, index) => (
            <span
              key={index}
              className={`dot ${index === selectedColorIndex ? "active" : ""}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              marginTop: "2rem",
            }}
          ></div>

          <div>
            <div>
              <div>
                <div>
                  <div className={styles.spanContainer}>
                    <span className={styles.name}> {product.name}</span>

                    <div>
                      <span className={styles.color}>Cor: </span>
                      <strong className={styles.strong}>
                        {product.variations[selectedColorIndex]?.color}
                      </strong>
                    </div>
                    <div className="thumbnail-container">
                      {product.variations
                        ?.filter(
                          (variation, index, self) =>
                            self.findIndex(
                              (v) => v.color === variation.color
                            ) === index
                        )
                        .map((variation, index) => (
                          <div key={index} className="thumbnail-wrapper">
                            <img
                              src={variation.urls[0]}
                              alt={variation.color}
                              className={
                                index === showBorder
                                  ? "thumbnail selected"
                                  : "thumbnail"
                              }
                              onClick={() => {
                                setShowBorder(index);
                                handleThumbnailClick(index);
                              }}
                            />
                          </div>
                        ))}
                    </div>

                    <span className={styles.price}>
                      {" "}
                      <strong> R$ {selectedPrice}</strong>
                    </span>
                  </div>
                  <div className={styles.sizeContainer}>
                    <span className={styles.span}>Selecione um Tamanho</span>
                    <div className={styles.buttonContainer}>
                      {sizesFromDatabase[selectedColorIndex]?.sizes &&
                        sizesFromDatabase[selectedColorIndex].sizes.map(
                          (size, sizeIndex) => (
                            <div
                              key={sizeIndex}
                              style={{
                                marginLeft: "1rem",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <button
                                className={`size-button ${
                                  size.size === selectedSize ? "active" : ""
                                }`}
                                style={{
                                  border:
                                    size.inStockSize === true
                                      ? "2px dashed #ccc"
                                      : "",
                                  color:
                                    size.inStockSize === true ? "#888" : "",
                                  cursor:
                                    size.inStockSize === true ? "" : "pointer",
                                }}
                                disabled={
                                  size.inStockSize === true
                                    ? isButtonDisabled
                                    : false
                                }
                                onClick={() =>
                                  handleSizeSelection(size.size, size.price)
                                }
                              >
                                {size.size}
                              </button>
                            </div>
                          )
                        )}
                    </div>

                    <div className={styles.buttonsContainer}>
                      {!showCartButton && (
                        <button
                          onClick={handleAddToCartAndOpenModal}
                          style={buttonStyleA}
                        >
                          COMPRAR
                        </button>
                      )}

                      {showCartButton && (
                        <button
                          onClick={handleClickOpenModal}
                          className={styles.buttons}
                          style={buttonStyleB}
                        >
                          COMPRAR
                        </button>
                      )}
                      <div className={styles.descriptionContainer}>
                        <h1 className={styles.h1}>Descrição</h1>
                        <span className={styles.description}>
                          {" "}
                          {product.description}
                        </span>
                      </div>
                      <FreteSelect />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {openCartModal && (
              <div className={styles.cartModal}>
                <div ref={modalRef} className={styles.cartModalContent}>
                  <CloseIcon
                    className={styles.cartClose}
                    onClick={handleClickCloseModal}
                  />
                  <div className={styles.cartModalContent__div}>
                    <p className={styles.cartModalContent__p}>
                      Você ainda não possui cadastro. Para fazer compras, por
                      favor, cadastre-se.
                    </p>
                    <Link
                      to={"/signUp"}
                      style={{
                        textDecoration: "none",
                      }}
                    >
                      <button className={styles.cartModalContent__button}>
                        cadastre-se
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Navbar />
      </div>
    </>
  );
};

export default ProductDetails;
