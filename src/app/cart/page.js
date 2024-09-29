"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import styles from "./Cart.module.css";
import Cookies from "js-cookie";
import { CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { logPageView } from "../../analytics";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useCart } from "../../../context/CartContext";
import Link from "next/link";
import { useConfig } from "../../../context/ConfigContext";
import CircularIndeterminate from "@/components/CircularIndeterminate/CircularIndeterminate";
import Navbar from "@/components/Navbar/Navbar";
import Header from "@/components/Header/Header";
import { useAuth } from "../../../context/AuthContext";
import LoginForm from "@/components/Login/LoginForm";
const Cart = () => {
  const [getCart, setGetCart] = useState([]);
  const [handleDeleteProduct, setHandleDeleteProduct] = useState(false);
  const [open, setOpen] = React.useState(false);
  const { removeFromCart } = useCart(); // Use a função removeFromCart do contexto do carrinho
  const [getTotal, setGetTotal] = useState({});
  
  const [selectedFreteIndex, setSelectedFreteIndex] = useState(
    typeof window !== "undefined" ? localStorage.getItem("selectedFreteIndex") : null
  );
  const userId = Cookies.get("userId"); // Obtenha o token do cookie
  const [cep, setCep] = useState(
    typeof window !== "undefined" ? localStorage.getItem("cep") : ""
  );

  const [frete, setFrete] = useState(null);
  const credentials = Cookies.get("role"); // Obtenha as credenciais do cookie
  const token = Cookies.get("token"); // Obtenha o token do cookie
  const [shippingFee, setShippingFee] = useState(0);
  const { logout, loggedIn } = useAuth(); // Obtendo o userId do contexto de autenticação
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const [updatedQuantity, setUpdatedQuantity] = useState(1);
  const [exceedAvailability, setExceedAvailability] = useState(1);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Estado para o loading
  const [isLoadingValueCart, setIsLoadingValueCart] = useState(false); // Estado para o loading

  const [openModal, setOpenModal] = useState(false);
  const modalRef = useRef(null);
  const [totalQuantity, setTotalQuantity] = useState([]);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const { apiUrl } = useConfig();
 
  const [cepViaCep, setCepViaCep] = useState("");

  const [isRadioButtonEnabled, setIsRadioButtonEnabled] = useState(false);
  useEffect(() => {
    // Atualiza o estado do botão baseado nas condições
    if (selectedFreteIndex !== null || getTotal.totalAmount >= 300) {
      setIsButtonEnabled(true);
    } else {
      setIsButtonEnabled(false);
    }
  }, [selectedFreteIndex, getTotal.totalAmount]);

  useEffect(() => {
    // Atualiza o estado do botão baseado nas condições
    if (selectedFreteIndex !== null || getTotal.totalAmount <= 300) {
      setIsRadioButtonEnabled(true);
    } else {
      setIsRadioButtonEnabled(false);
    }
  }, [selectedFreteIndex, getTotal.totalAmount]);

  const handleClickOpenModal = (uniqueId) => {
    setDeleteProductId(uniqueId);

    setOpenModal(true);
  };

  const handleClickCloseModal = () => {
    setOpenModal(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        openModal
      ) {
        setOpenModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  function handleProducts() {
    setLoading(true); // Define o estado de carregamento como falso

    axios
      .get(`${apiUrl}/api/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setGetCart(response.data.cart.products); // Define os produtos do carrinho
        setGetTotal(response.data.cart); // Define o total do carrinho
        setTotalQuantity(response.data.cart.TotalQuantity);
        setLoading(false); // Define o estado de carregamento como falso
      })
      .catch((error) => {
        setLoading(false); // Define o estado de carregamento como falso

        console.log("Erro ao visualizar frete.", error);
      });
  }

  useEffect(() => {
    handleProducts();
  }, []);

  const handleDelete = useCallback(
    (uniqueId) => {
      axios
        .delete(`${apiUrl}/api/remove-from-cart/${userId}/${uniqueId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response.data.message);
          // Atualize o estado do carrinho na sua aplicação, removendo o item correto
          setGetCart((prevCart) =>
            prevCart.filter((item) => item._id !== uniqueId)
          );
          handleProducts(); // Atualize outros dados conforme necessário
          console.log("uniqueId", uniqueId);
          removeFromCart();
        })
        .catch((error) => {
          console.error("Erro ao remover produto do carrinho:", error);
        });
    },
    [userId, removeFromCart]
  );


  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cep", cep);
    }
  }, [cep]);
  useEffect(() => {
    const fetchFrete = async () => {
      try {
        const responseGet = await axios.get(`${apiUrl}/api/frete/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFrete(responseGet.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchFrete();
  }, [cep, userId]);

  useEffect(() => {
    if (typeof window !== "undefined" && frete && frete.length > 0) {
      setSelectedFreteIndex(
        +localStorage.getItem("selectedFreteIndex") || null
      );
    }
  }, [frete]);

  const handleRadioClick = async (index) => {
    setIsLoading(true); // Inicia o loading

    try {
      const freteId = frete[index]._id;
      await axios.put(
        `${apiUrl}/api/cart/${userId}/shippingFee/${freteId}`,
        {
          // Remova as linhas de cabeçalho daqui
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Remova 'Credentials: credentials'
          },
        }
      );
      setSelectedFreteIndex(index);
      localStorage.setItem("selectedFreteIndex", index);
      // After updating the shipping fee, fetch the updated cart data
      const cartResponse = await axios.get(`${apiUrl}/api/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the cart products and total in state variables
      setGetCart(cartResponse.data.cart.products);
      setGetTotal(cartResponse.data.cart);

      setShippingFee(cartResponse.data.cart.shippingFee);
      setGetTotal(cartResponse.data.cart); // Define o total do carrinho
      setTotalQuantity(cartResponse.data.cart.TotalQuantity);
      setLoading(false); // Define o estado de carregamento como falso
    } catch (error) {
      console.error("Error updating shipping fee:", error);
    } finally {
      setIsLoading(false); // Finaliza o loading
    }
  };

  const handleAddShippingFee = () => {
    if (selectedFreteIndex !== null) {
      // Verifica se um frete foi selecionado
      if (getTotal.totalAmount >= 300) {
      }
    } else {
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Inicia o loading

    try {
      // Faz a solicitação POST para obter os dados do frete com o novo CEP
      await axios.post(
        `${apiUrl}/api/frete/${userId}`,
        { cep },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Adicionando content-type
          },
        }
      );

      // Atualiza o estado do frete com os dados do frete da requisição GET
      const responseGet = await axios.get(`${apiUrl}/api/frete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("log", userId);
      setFrete(responseGet.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false); // Finaliza o loading
    }
  };

  const getAvailableQuantity = (item) => {
    const variation = item.productId.variations.find(
      (variation) => variation.color === item.color
    );
    const sizeObj = variation?.sizes.find((size) => size.size === item.size);
    return sizeObj ? sizeObj.quantityAvailable : 0;
  };

  const charLimit = 24;

  const handleViaCepData = async () => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      setCepViaCep(response.data);
      console.log("handleViaCepData", response.data);
    } catch (error) {}
  };
  useEffect(() => {
    handleViaCepData(); // Atualiza cepViaCep

    if (getTotal.totalAmount >= 300 || cepViaCep.localidade === "Fortaleza") {
      setShippingFee(0); // Frete grátis
    } else if (
      selectedFreteIndex !== null &&
      frete &&
      frete[selectedFreteIndex]
    ) {
      setShippingFee(frete[selectedFreteIndex].valorFrete);
    }
  }, [getTotal.totalAmount, selectedFreteIndex, frete, cep]); // Dependências do useEffect

  function handleMessage() {
    let message;
    switch (true) {
      case getTotal.totalAmount >= 300:
        message = "Para compras acima de 300 reais, o frete é grátis";
        break;
      case cepViaCep.localidade === "Fortaleza":
        message = "Para compras em Fortaleza o frete é grátis";
        break;
      default:
        message = (
          <span className={styles.green}>
            Escolha uma opção de frete para prosseguir.
          </span>
        );
        break;
    }
    return message; // Retorne a mensagem
  }

  return (
    <>
    {!loggedIn ? <LoginForm></LoginForm>: 
    
    <div className={styles.cartContainer}>
      <Header />
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

      <Navbar />
      {/* <Helmet>
        <title>Carrinho de Compras - Loja Mediewal</title>
        <meta
          name="description"
          content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
        />
      </Helmet> */}
      {loading ? ( // Se estiver carregando, exibimos o CircularProgress
        <div className={styles.loading}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {getCart.length === 0 && loggedIn === true ? (
            ""
          ) : (
            <>
              {" "}
              <div className={styles.totalQuantityContainer}>
                <div className={styles.cartContainer__totalQuantity}>
                  <div className={styles.justifyContent}>
                    <span className={styles.span}>Quatidade Total</span>
                    {totalQuantity > 0 && (
                      <p className={styles.span}>{totalQuantity}</p>
                    )}
                  </div>

                  <div className={styles.justifyContent}>
                    <span className={styles.span}>valor do frete</span>
                    <span className={styles.span}>
                      R${" "}
                      {shippingFee.toFixed(2) == 0
                        ? "0"
                        : shippingFee.toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.justifyContent}>
                    <span className={styles.span}>Valor total</span>
                    <span className={styles.total}>
                      R${" "}
                      {getTotal.totalAmount && getTotal.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <span className={styles.promo}>{handleMessage()}</span>
                </div>
              </div>
            </>
          )}

          {getCart.length > 0 && (
            <>
              {selectedFreteIndex === null && getTotal.totalAmount < 300 && (
                <p
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "10px",
                    color: "red",
                  }}
                >
                  Por favor, selecione um frete antes de prosseguir.
                </p>
              )}
              <Link
                href={
                  getTotal.totalAmount >= 300 ||
                  cepViaCep.localidade === "Fortaleza" ||
                  (frete?.length > 0 && selectedFreteIndex !== null)
                    ? `/payment/${totalQuantity}/${
                        shippingFee.toFixed(2) === "0"
                          ? "0"
                          : shippingFee.toFixed(2)
                      }/${getTotal.totalAmount.toFixed(2)}`
                    : "#"
                }
                className={styles.LinkContainer}
              >
                <button
                  onClick={handleAddShippingFee}
                  style={{
                    pointerEvents:
                      getTotal.totalAmount >= 300 ||
                      cepViaCep.localidade === "Fortaleza" ||
                      (shippingFee &&
                        frete?.length > 0 &&
                        selectedFreteIndex !== null)
                        ? "auto"
                        : "none",
                    opacity:
                      isButtonEnabled || cepViaCep.localidade === "Fortaleza"
                        ? 1
                        : 0.5,
                  }}
                  disabled={
                    !(
                      getTotal.totalAmount >= 300 ||
                      cepViaCep.localidade === "Fortaleza" ||
                      (shippingFee &&
                        frete?.length > 0 &&
                        selectedFreteIndex !== null)
                    )
                  }
                  className={styles.LinkContainer__button}
                >
                  Fazer Pedido
                </button>
              </Link>
            </>
          )}

          {getCart.length === 0 && !loggedIn && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "15rem",
                }}
              >
                <div
                  style={{
                    marginTop: "5rem",
                    fontFamily: "poppins",
                    fontSize: "1rem",
                    fontWeight: "400",
                  }}
                >
                  {" "}
                  Somente os usuários registrados podem acessar esta página faça{" "}
                  <Link
                    href={"/perfil"}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {" "}
                    <b
                      style={{
                        fontFamily: "poppins",
                        fontWeight: "600",
                        fontSize: "1.2rem",
                      }}
                    >
                      {" "}
                      Login
                    </b>
                    .
                  </Link>{" "}
                </div>
              </div>
            </>
          )}
          {getTotal.totalAmount >= 300 ? (
            ""
          ) : (
            <>
              {" "}
              {getCart.length > 0 && (
                <div className={styles.shippingFeeContainer}>
                  <form
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <input
                      type="text"
                      value={cep}
                      onChange={(event) => setCep(event.target.value)}
                      placeholder="Digite um cep..."
                      className={styles.shippingFeeContainer__input}
                    />

                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className={styles.shippingFeeContainer__button}
                    >
                      {" "}
                      <SearchIcon /> Buscar{" "}
                    </button>
                  </form>
                  {isLoading ? (
                    <div className={styles.CircularIndeterminate}>
                      <CircularIndeterminate />
                      <p>Carregando...</p>
                    </div>
                  ) : (
                    <>
                      {frete && (
                        <div>
                          {frete.map((item, index) => (
                            <div key={index}>
                              <div
                                className={styles.freteContainer}
                                onClick={() => handleRadioClick(index)}
                              >
                                <input
                                  type="radio"
                                  name="selectedFrete"
                                  value={index}
                                  onClick={() => handleRadioClick(index)}
                                  checked={selectedFreteIndex === index}
                                  style={{
                                    pointerEvents: isRadioButtonEnabled
                                      ? "auto"
                                      : "none",
                                    opacity: isRadioButtonEnabled ? 1 : 0.5,
                                  }}
                                  disabled={!isRadioButtonEnabled}
                                  className={styles.radio}
                                />

                                <div
                                  className={styles.interContainer}
                                  onClick={() => handleRadioClick(index)}
                                >
                                  <div className={styles.flex}>
                                    <img
                                      src={item.logo}
                                      alt="logo das transportadoras"
                                      className={
                                        item.nomeTransportadora === "Jadlog"
                                          ? styles.Jadlog
                                          : styles.image
                                      }
                                    />

                                    <p className={styles.span}>
                                      {item.nomeTransportadora}
                                    </p>
                                  </div>

                                  <div className={styles.flex}>
                                    {" "}
                                    <p className={styles.span}>
                                      {" "}
                                      Entrega Prevista{" "}
                                      {item.dataPrevistaEntrega &&
                                        item.dataPrevistaEntrega
                                          .split("T")[0]
                                          .split("-")
                                          .reverse()
                                          .join("/")}
                                      ({item.prazoEntrega} dias)
                                    </p>
                                  </div>

                                  <div className={styles.flex}>
                                    <p className={styles.span}>
                                      valor:{" "}
                                      <b className={styles.priceValue}>
                                        R$ {item.valorFrete}
                                      </b>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {getCart.length === 0 && loggedIn === true ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "12rem",
              }}
            >
              <img src="https://i.ibb.co/x765V9y/bag-4.png" alt="" />
              <p>O carrinho está vazio.</p>
            </div>
          ) : (
            <>
              {getCart.map((item, index) => (
                <div
                  key={item._id} // Use o _id do produto como chave
                  className={styles.ExternalContainer}
                >
                  <div className={styles.ProductsContainer}>
                    <div className={styles.ProductsContainer__firstContainer}>
                      <div>
                        {item.productId &&
                          item.productId.variations && ( // Add null check for productId and variations
                            <img
                              src={
                                item.productId.variations.find(
                                  (variation) => variation.color === item.color
                                )?.urls[0]
                              }
                              alt={item.productId.name}
                              className={styles.ProductsContainer__image}
                            />
                          )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                        }}
                        className={styles.textsContainer}
                      >
                        <div className={styles.span}>
                          {" "}
                          {item.productId.variations &&
                          item.productId.variations.some((variation) =>
                            variation.sizes.some(
                              (size) => size.quantityAvailable > 0
                            )
                          ) ? (
                            <p>{`Apenas ${getAvailableQuantity(
                              item
                            )} unidades em estoque`}</p>
                          ) : (
                            <p className={styles.p}>0 unidades em estoque</p>
                          )}
                        </div>
                        <span className={styles.span}>
                          {item.productId.name.length > charLimit
                            ? item.productId.name.substring(0, charLimit) +
                              "..."
                            : item.productId.name}
                        </span>

                        <span className={styles.span}>
                          {" "}
                          Tamanho: {item.size}
                        </span>
                        <span className={styles.span}>Cor: {item.color}</span>
                        <div className={styles.price}>R$ {item.price}</div>

                        <div>
                          <div className={styles.quantityContainer}>
                            <RemoveIcon
                              onClick={() => {
                                const newQuantity = item.quantity - 1; // Defina newQuantity antes de usá-la
                                if (newQuantity >= 0) {
                                  const newCart = [...getCart];
                                  newCart[index].quantity = newQuantity;
                                  const productId = item.productId._id;
                                  const color = item.color;
                                  const size = item.size;
                                  const token = Cookies.get("token");
                                  setIsLoadingValueCart(true); // Inicia o loading

                                  axios
                                    .put(
                                      `${apiUrl}/api/update-quantity/${userId}/${productId}/${color}/${size}`,
                                      { quantity: newQuantity },
                                      {
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      }
                                    )
                                    .then((response) => {
                                      setGetCart((prevCart) => {
                                        const newCart = [...prevCart];
                                        newCart[index].quantity = newQuantity;
                                        return newCart;
                                      });
                                      axios
                                        .get(`${apiUrl}/api/cart/${userId}`, {
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        })
                                        .then((response) => {
                                          setGetCart(
                                            response.data.cart.products
                                          ); // Define os produtos do carrinho
                                          setGetTotal(response.data.cart); // Define o total do carrinho
                                          setTotalQuantity(
                                            response.data.cart.TotalQuantity
                                          );
                                          setLoading(false); // Define o estado de carregamento como falso
                                        })
                                        .catch((error) => {
                                          setLoading(false); // Define o estado de carregamento como falso

                                          console.log(
                                            "Erro ao visualizar frete.",
                                            error
                                          );
                                        });
                                      setIsLoadingValueCart(false); // Finaliza o loading
                                    })
                                    .catch((error) => {
                                      setIsLoadingValueCart(false); // Finaliza o loading

                                      console.log(
                                        "Erro ao atualizar quantidade do produto no carrinho.",
                                        error
                                      );
                                    });
                                }
                              }}
                              style={{ cursor: "pointer" }}
                            />

                            {isLoadingValueCart ? (
                              <CircularProgress size={24} /> // Exibe o loading enquanto o estado isLoading for true
                            ) : (
                              <span
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value);
                                  if (newQuantity <= 0) {
                                    // Se a quantidade for inválida, não faz nada
                                    return;
                                  }

                                  const availableQuantity =
                                    getAvailableQuantity(item);

                                  if (newQuantity > availableQuantity) {
                                    alert(
                                      "A quantidade desejada excede a quantidade disponível no estoque."
                                    );
                                    return;
                                  }

                                  const newCart = [...getCart];
                                  newCart[index].quantity = newQuantity;
                                  setGetCart(newCart);
                                  handleQuantityChange(
                                    item.productId._id,
                                    newQuantity
                                  );
                                }}
                                className={styles.inputContainer}
                              >
                                {item.quantity}
                              </span>
                            )}

                            <AddIcon
                              onClick={() => {
                                setIsLoadingValueCart(true); // Inicia o loading

                                const newQuantity = item.quantity + 1;
                                const availableQuantity =
                                  getAvailableQuantity(item);

                                if (newQuantity > availableQuantity) {
                                  toast.success(
                                    "A quantidade desejada excede a quantidade disponível no estoque."
                                  );
                                  return;
                                }

                                const productId = item.productId._id;
                                const color = item.color;
                                const size = item.size;

                                const token = Cookies.get("token");

                                axios
                                  .put(
                                    `${apiUrl}/api/update-quantity/${userId}/${productId}/${color}/${size}`,
                                    { quantity: newQuantity },
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    }
                                  )
                                  .then((response) => {
                                    const products =
                                      response.data.cart.products;

                                    setGetCart((prevCart) => {
                                      const newCart = [...prevCart];
                                      const productIndex = newCart.findIndex(
                                        (product) =>
                                          product.productId._id === productId &&
                                          product.color === color &&
                                          product.size === size
                                      );
                                      if (productIndex !== -1) {
                                        newCart[productIndex].quantity =
                                          newQuantity;
                                      }
                                      return newCart;
                                    });

                                    axios
                                      .get(`${apiUrl}/api/cart/${userId}`, {
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      })
                                      .then((response) => {
                                        setGetCart(response.data.cart.products);
                                        setGetTotal(response.data.cart);
                                        setTotalQuantity(
                                          response.data.cart.TotalQuantity
                                        );
                                        setLoading(false);
                                      })
                                      .catch((error) => {
                                        setLoading(false);
                                        console.log(
                                          "Erro ao visualizar frete.",
                                          error
                                        );
                                      });
                                  })
                                  .catch((error) => {
                                    setIsLoadingValueCart(false);

                                    console.log(
                                      "Erro ao atualizar quantidade do produto no carrinho.",
                                      error
                                    );
                                  })
                                  .finally(() => {
                                    setIsLoadingValueCart(false); // Sempre finalizar o loading
                                  });
                                setUpdatedQuantity(newQuantity);
                                console.log("quantidade", newQuantity);
                              }}
                              style={{
                                cursor: "pointer",
                                color:
                                  item.quantity === getAvailableQuantity(item)
                                    ? "rgb(189, 189, 189)"
                                    : "rgb(33, 33, 33)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.deleteIconContainer}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".5rem",
                          color: "rgb(236, 62, 62)",
                          cursor: "pointer",
                        }}
                        className={styles.deleteIconContainer__DeleteIcon}
                        onClick={() => handleClickOpenModal(item._id)}
                      >
                        <DeleteIcon style={{}} />
                        <span
                          style={{ fontWeight: "600" }}
                          className={styles.deleteIconContainer__Excluir}
                        >
                          Excluir
                        </span>
                      </div>
                      <div className={styles.texts}>
                        <span
                          className={styles.spanName}
                          style={{
                            color:
                              item.quantity === getAvailableQuantity(item)
                                ? "#E71E1E"
                                : "#21BF45",
                          }}
                        >
                          {item.quantity === getAvailableQuantity(item)
                            ? "Produto fora de estoque"
                            : "Produto em estoque"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {openModal && (
            <div className={styles.Modal}>
              <div ref={modalRef} className={styles.ModalContent}>
                <span className={styles.Close} onClick={handleClickCloseModal}>
                  <CloseIcon />
                </span>
                <h1
                  style={{ fontSize: "1.5rem" }}
                  className={styles.ModalContent__p}
                >
                  Essa ação e irreversível você quer Excluir esse produto do
                  carrinho?
                </h1>
                <div className={styles.buttonContainer}>
                  <button
                    onClick={() => {
                      handleDelete(deleteProductId);
                      handleClickCloseModal();
                    }}
                    className={styles.confirmButton}
                  >
                    SIM
                  </button>

                  <button
                    type="button"
                    onClick={handleClickCloseModal}
                    className={styles.cancel}
                  >
                    NÃO
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    
    
    }
    </>
  );
};

export default Cart;
