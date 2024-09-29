import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "./cartSidebar.module.css";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAuth } from "../../../context/AuthContext";
import { useConfig } from "../../../context/ConfigContext";
import Link from "next/link";

const CartSidebar = () => {
  const [getCart, setGetCart] = useState([]);
  const [getTotal, setGetTotal] = useState({});
  const [totalQuantity, setTotalQuantity] = useState({});

  const userId = Cookies.get("userId");
  const token = Cookies.get("token");
  const { logout, loggedIn } = useAuth();
  const productsContainerRef = useRef(null);
  const [exceedAvailability, setExceedAvailability] = useState(1);
  const [changeStockStatus, setChangeStockStatus] = useState(false);
  const [stockStatus, setStockStatus] = useState({});
  const { apiUrl } = useConfig();

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setGetCart(response.data.cart.products);
        setGetTotal(response.data.cart);
        setTotalQuantity(response.data.cart.TotalQuantity);
      })
      .catch((error) => {
        console.log("Erro ao visualizar frete.", error);
      });
  }, [userId, token]);

  const getAvailableQuantity = (item) => {
    const variation = item.productId.variations.find(
      (variation) => variation.color === item.color
    );
    const sizeObj = variation?.sizes.find((size) => size.size === item.size);
    return sizeObj ? sizeObj.quantityAvailable : 0;
  };

  const statusStyle = {
    color: changeStockStatus === true ? "red" : "black",
    fontSize: "1rem",
  };

  useEffect(() => {
    // Atualizar status do estoque quando houver mudanças no carrinho
    const newStockStatus = {};
    getCart.forEach((item) => {
      newStockStatus[item.productId._id] =
        getAvailableQuantity(item) > 0
          ? "Produto em estoque"
          : "Produto fora de estoque";
    });
    setStockStatus(newStockStatus);
  }, [getCart]);

  return (
    <div style={{ position: "relative" }} className={styles.container}>
      {getCart.length === 0 && !loggedIn && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "15rem",
            }}
          >
            {/* <Helmet>
              <title>Carrinho de Compras - Loja Mediewal</title>
              <meta
                name="description"
                content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
              />
            </Helmet> */}
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

      {getCart.length === 0 && loggedIn ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "15rem",
          }}
        >
          <img
            src="https://i.ibb.co/x765V9y/bag-4.png"
            alt="icone do carrinho"
            style={{ width: "15vw" }}
          />
          <p>O carrinho está vazio.</p>
        </div>
      ) : (
        <div className={styles.verticalScroll} ref={productsContainerRef}>
          {getCart.map((item, index) => (
            <div key={index} className={styles.product}>
              <div
                style={{
                  border: "1px solid #e9e9e9",
                  display: "flex",
                  flexDirection: "column",
                  width: "20vw",
                  justifyContent: "space-between",
                  padding: "16px 24px 16px 16px",
                  marginBottom: "3rem",
                }}
              >
                <div className={styles.quantity}>
                  {" "}
                  {item.productId.variations &&
                  item.productId.variations.some((variation) =>
                    variation.sizes.some((size) => size.quantityAvailable > 0)
                  ) ? (
                    <p>{`Apenas ${getAvailableQuantity(
                      item
                    )} unidades em estoque`}</p>
                  ) : (
                    <p className={styles.p}>0 unidades em estoque</p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "row" }}>
                  <div>
                    {item.productId.variations && (
                      <img
                        src={
                          item.productId.variations.find(
                            (variation) => variation.color === item.color
                          )?.urls[0]
                        }
                        alt={item.productId.name}
                        className={styles.image}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                    className={styles.texts}
                  >
                    <span className={styles.spanName}>
                      {" "}
                      {item.productId.name}
                    </span>
                    <span className={styles.spanSize}>
                      {" "}
                      Tamanho: {item.size}
                    </span>
                    <span className={styles.spanColor}> Cor: {item.color}</span>
                    {item.productId.variations &&
                      item.productId.variations
                        .find((variation) => variation.color === item.color)
                        ?.sizes.map(
                          (size) =>
                            size.size === item.size && (
                              <div key={size.size}>
                                <span className={styles.spanPrice}>
                                  R${size.price && size.price.toFixed(2)}
                                </span>
                              </div>
                            )
                        )}
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
                                    setGetCart(response.data.cart.products); // Define os produtos do carrinho
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
                              })
                              .catch((error) => {
                                console.log(
                                  "Erro ao atualizar quantidade do produto no carrinho.",
                                  error
                                );
                              });
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      />
                      <span
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value);
                          const newCart = [...getCart];
                          newCart[index].quantity = newQuantity;
                          setGetCart(newCart);
                          handleQuantityChange(item.productId._id, newQuantity);
                        }}
                        style={{}}
                        className={styles.inputContainer}
                      >
                        {" "}
                        {item.quantity}
                      </span>
                      <AddIcon
                        onClick={() => {
                          const newQuantity = item.quantity + 1;
                          const availableQuantity = getAvailableQuantity(item);

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
                              const products = response.data.cart.products;

                              setGetCart((prevCart) => {
                                const newCart = [...prevCart];
                                const productIndex = newCart.findIndex(
                                  (product) =>
                                    product.productId._id === productId &&
                                    product.color === color &&
                                    product.size === size
                                );
                                if (productIndex !== -1) {
                                  newCart[productIndex].quantity = newQuantity;
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
                              console.log(
                                "Erro ao atualizar quantidade do produto no carrinho.",
                                error
                              );
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
                    <div>
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
              </div>
            </div>
          ))}
        </div>
      )}

      {getCart.length > 0 && (
        <div style={{ marginLeft: "14rem" }}>
          {getTotal && typeof getTotal === "object" && getTotal.totalAmount && (
            <div className={styles.totalAmountAndQuantityContainer}>
              <div className={styles.TotalQuantity}>
                <span>
                  total de <b style={{ color: "#212121" }}>{totalQuantity}</b>{" "}
                  produto(s) na sacola{" "}
                </span>
                <span className={styles.TotalQuantity}></span>
              </div>
              <div className={styles.totalAmount}>
                <span className={styles.totalAmount}> Total:</span>
                <span className={styles.totalAmount}>
                  {" "}
                  R${getTotal.totalAmount && getTotal.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {getCart.length > 0 && (
        <div className={styles.buttonCart}>
          <Link href={"/cart"}>
            <button
              style={{
                backgroundColor: "#E94D36",
                color: "white",
                border: "none",
                width: "20vw",
                padding: ".8rem",
                fontWeight: "600",
                fontFamily: "poppins, sans-serif",
                fontSize: "1rem",
                cursor: "pointer",
                position: "absolute",
                marginTop: "10rem",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              IR PRA SACOLA
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;
