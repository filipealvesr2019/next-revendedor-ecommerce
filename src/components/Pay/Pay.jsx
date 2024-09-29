import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Cookies from "js-cookie";
import ImageComponent from "./ImageComponent";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import styles from "./Pay.module.css";
import { useCart } from "../context/CartContext";
import Header from "./Header";
import { useConfig } from "../context/ConfigContext";
import { logPageView } from "../../analytics";
import { Helmet } from "react-helmet";

const Pay = () => {
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [errorMessage, setErrorMessage] = useState("");

  const userId = Cookies.get("userId"); // Obtenha o token do cookie
  const [encodedImage, setEncodedImage] = useState(null);
  const [pixCode, setPixCode] = useState(null);
  const [getCart, setGetCart] = useState([]);
  const [getTotal, setGetTotal] = useState({});
  const token = Cookies.get("token"); // Obtenha o token do cookie
  const [buttonClicked, setButtonClicked] = useState(false);
  const navigate = useNavigate(); // Inicialize o hook useNavigate
  const [showContent, setShowContent] = useState(true);
  const [boleto, setBoleto] = useState(null);
  const [creditCard, setCreditCard] = useState(null);
  const [pix, setPix] = useState(true); // Estado para controlar o carregamento

  const [pixLoading, setPixLoading] = useState(false); // Estado para controlar o carregamento do pagamento PIX
  const [creditCardLoading, setCreditCardLoading] = useState(false); // Estado para controlar o carregamento do pagamento PIX
  const [boletoLoading, setBoletoLoading] = useState(false); // Estado para controlar o carregamento do pagamento PIX
  const [creditCardWithPaymentLinkLoading, setCreditCardWithPaymentLinkLoading] = useState(false); // Estado para controlar o carregamento do pagamento PIX

  
  const { clearCart } = useCart(); // Use a função removeFromCart do contexto do carrinho
  const { quantity, shippingFee, totalPrice } = useParams();

  const [creditCardWithPaymentLink, setCreditCardWithPaymentLink] = useState(null);

  const { apiUrl } = useConfig();
  const location = useLocation();

  useEffect(() => {
    logPageView();
  }, [location]);
  const handleChangeContentClick = () => {
    setShowContent(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "number" && value.replace(/\D/g, "").length < 15) {
      setErrorMessage("O número do cartão de crédito deve ter 15 dígitos.");
    } else {
      setErrorMessage("");
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      ...(name === "pacelas" && { installmentCount: value }),
    }));
  };

  const handleChangePixAndBoleto = (event) => {
    const { name, value } = event.target;
    setPaymentMethod(value);
  };

  const handleCreditCardPayment = (event) => {
    const { name, value } = event.target;
    setPaymentMethod(value);
  };

  // pagar com pix sem checkout transparente
  const handlePixPayment = async () => {
    setPixLoading(true); // Ativar o loader

    try {
      const response = await fetch(
        `${apiUrl}/api/pixQRcodeStatico/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setPixLoading(false); // Desativar o loader

      setPix(data);
      handleChangeContentClick();

      // Redirecionar para a URL de pagamento PIX
      setEncodedImage(data.encodedImage);
      setPixCode(data.payload);
      console.log("pixQRcodeStatico", data);
      await clearCart();
    } catch (error) {
      setPixLoading(false); // Certifique-se de desativar o loader em caso de erro

      console.error(error);
    }
  };

  // pagar boleto sem checkout transparente
  const handleBoletoPayment = async () => {
    setBoletoLoading(true);

    try {
      const response = await fetch(
        `${apiUrl}/api/boleto/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setBoletoLoading(false);
      console.log(data);
      setBoleto(data);
      // // Redirecionar para a URL de pagamento PIX
      window.location.href = data.bankSlipUrl;

      // Atualiza o estado com a URL do boleto
      await clearCart();
    } catch (error) {
      setBoletoLoading(false);
      console.error(error);
    }
  };



  


  const handleCreditCardPaymentLink = async () => {
    setCreditCardWithPaymentLinkLoading(true);
  
    try {
      const response = await fetch(`${apiUrl}/api/crediCardWithPaymentLink/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCreditCardWithPaymentLinkLoading(false);
      console.log(data);
  
      // Update the state with the response data
      setCreditCardWithPaymentLink(data);
  
      // Redirect to the payment link
      window.location.href = data.invoiceUrl;
      
      // Clear the cart
      await clearCart();
    } catch (error) {
      setCreditCardWithPaymentLinkLoading(false);
      console.error(error);
    }
  };
  





  //  pix copia e cola
  const [status, setStatus] = useState("copiar");

  const handleClick = () => {
    setStatus("copiado");
    // Aqui você pode adicionar qualquer lógica adicional que deseja executar quando o botão for clicado
    // Por exemplo, copiar algum texto para a área de transferência
    navigator.clipboard.writeText(pixCode);
  };

  const [formData, setFormData] = useState({
    custumerId: userId, // Usando o userId do usuário logado
    installmentCount: "",
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
  });

  const formatCreditCardNumber = (value) => {
    const formattedValue = value.replace(/\D/g, "");
    const maskedValue = formattedValue.replace(/(\d{4})(?=\d)/g, "$1 ");
    return maskedValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonClicked(true); // Define o estado como true quando o botão é clicado
    setCreditCardLoading(true);
    try {

      const updatedFormData = {
        ...formData,
        installmentCount: formData.pacelas,
      };

      const response = await axios.post(
        `${apiUrl}/api/creditCardWithoutTokenization/${userId}`,
        updatedFormData, // Aqui está o corpo da requisição
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCreditCardLoading(false);
      handleChangeContentClick();

      setCreditCard(response.data);

      await clearCart();

      if (response.data) {
        navigate("/success");
      }
    } catch (error) {
      setCreditCardLoading(false);
      console.error("Erro ao enviar informações do usuário:", error);
      // Trate erros aqui, como exibir uma mensagem para o usuário
    }
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setGetTotal(response.data.cart);
      })
      .catch((error) => {
        console.log("Erro ao visualizar frete.", error);
      });
  }, [userId, getTotal]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Header />

      <Navbar />
      <Helmet>
        <title>Página de Pagamento - Loja Mediewal</title>
        <meta
          name="description"
          content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
        />
      </Helmet>
      <div style={{ textAlign: "center", marginTop: "10rem" }}>
        {showContent ? (
          <div>
            {pixLoading || creditCardLoading || boletoLoading ? (
              <>
                <div
                  style={{
                    marginTop: "10rem",
                  }}
                >
                  <CircularProgress />
                  <p>Carregando...</p>
                </div>
              </>
            ) : (
              <>
                <div id="div1">
                  <div className={styles.paymentContainer}>
                    <div>
                      <h1
                        style={{
                          fontFamily: "poppins",
                          fontWeight: "500",
                          fontSize: "1.1rem",
                        }}
                      >
                        Escolha o método de pagamento:
                      </h1>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".5rem",
                        }}
                      >
                        <input
                          type="radio"
                          id="pix"
                          name="paymentMethod"
                          value="pix"
                          checked={paymentMethod === "pix"}
                          onChange={handleChangePixAndBoleto}
                        />
                        <label
                          htmlFor="pix"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            fontFamily: "poppins",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                          }}
                        >
                          <img
                            src="https://i.imgur.com/MXgEf5F.png"
                            alt="icone do pix"
                            style={{
                              maxWidth: "14vw",
                            }}
                          />{" "}
                          PIX
                        </label>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".5rem",
                        }}
                      >
                        <input
                          type="radio"
                          id="boleto"
                          name="paymentMethod"
                          value="boleto"
                          checked={paymentMethod === "boleto"}
                          onClick={handleChangePixAndBoleto}
                        />
                        <label
                          htmlFor="boleto"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            fontFamily: "poppins",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                          }}
                        >
                          <img
                            src="https://i.imgur.com/m9N1n50.png"
                            alt="icone do boleto"
                            style={{ maxWidth: "14vw" }}
                          />{" "}
                          Boleto
                        </label>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".5rem",
                        }}
                      >
                        <input
                          type="radio"
                          id="cartao"
                          name="paymentMethod"
                          value="cartao"
                          checked={paymentMethod === "cartao"}
                          onClick={handleCreditCardPayment}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="cartao"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            fontFamily: "poppins",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                          }}
                        >
                          {" "}
                          <img
                            src="https://i.imgur.com/8irAIsv.png"
                            alt="icone do Cartão de Crédito"
                          />{" "}
                          Cartão de Crédito
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className={styles.paymentDetails}>
                        <div className={styles.justifyContent}>
                          <span className={styles.span}>Quatidade Total</span>
                          {quantity > 0 && (
                            <p className={styles.span}>{quantity}</p>
                          )}
                        </div>

                        <div className={styles.justifyContent}>
                          <span className={styles.span}>valor do frete</span>
                          <span className={styles.span}>R$ {shippingFee}</span>
                        </div>
                        <div className={styles.justifyContent}>
                          <span className={styles.span}>Valor total</span>
                          <span className={styles.total}>R$ {totalPrice}</span>
                        </div>
                      </div>
                      {paymentMethod === "pix" && (
                        <button
                          onClick={handlePixPayment}
                          className={styles.ButtonDataCustomer}
                        >
                          Pagar com Pix
                        </button>
                      )}
                      {paymentMethod === "boleto" && (
                        <button
                          onClick={handleBoletoPayment}
                          className={styles.ButtonDataCustomer}
                        >
                          Pagar com Boleto
                        </button>
                      )}
 

                      <div>
                        {" "}
                        {paymentMethod === "cartao" && (
                          <>
                            {/* <form
                              onSubmit={handleSubmit}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                fontFamily: "poppins",
                                fontWeight: "400",
                                fontSize: "1.1rem",
                                marginBottom: "1rem",
                              }}
                            >
                              {errorMessage && (
                                <p style={{ color: "red" }}>{errorMessage}</p>
                              )}
                              <div className={styles.childContainer}>
                                <div className={styles.child}>
                                  <label className={styles.label}>
                                    nome do titular:
                                  </label>
                                  <input
                                    type="text"
                                    name="holderName"
                                    onChange={handleChange}
                                    value={formData.holderName}
                                    style={{
                                      border:
                                        !formData.holderName.trim() &&
                                        buttonClicked
                                          ? "1px solid red"
                                          : "1px solid #ccc",
                                    }}
                                    placeholder="carla alves"
                                    className={styles.input}
                                  />
                                </div>
                                <div className={styles.child}>
                                  <label className={styles.label}>
                                    numero do cartão:
                                  </label>

                                  <input
                                    type="number"
                                    name="number"
                                    onChange={handleChange}
                                    value={formData.number}
                                    style={{
                                      border:
                                        !formData.number.trim() && buttonClicked
                                          ? "1px solid red"
                                          : "1px solid #ccc",
                                    }}
                                    placeholder="1234 567890 12345"
                                    className={styles.input}
                                  />
                                </div>

                                <div className={styles.child}>
                                  <label className={styles.label}>
                                    mês de vencimento:
                                  </label>
                                  <input
                                    type="text"
                                    name="expiryMonth"
                                    onChange={handleChange}
                                    value={formData.expiryMonth}
                                    style={{
                                      border:
                                        !formData.expiryMonth.trim() &&
                                        buttonClicked
                                          ? "1px solid red"
                                          : "1px solid #ccc",
                                    }}
                                    className={styles.input}
                                    placeholder="05"
                                  />
                                </div>

                                <div className={styles.child}>
                                  <label className={styles.label}>
                                    Ano de vencimento:
                                  </label>
                                  <input
                                    type="text"
                                    name="expiryYear"
                                    onChange={handleChange}
                                    value={formData.expiryYear}
                                    style={{
                                      border:
                                        !formData.expiryYear.trim() &&
                                        buttonClicked
                                          ? "1px solid red"
                                          : "1px solid #ccc",
                                    }}
                                    placeholder="2025"
                                    className={styles.input}
                                  />
                                </div>

                                <div className={styles.child}>
                                  <label className={styles.label}>CVV:</label>
                                  <input
                                    type="text"
                                    name="ccv"
                                    onChange={handleChange}
                                    value={formData.ccv}
                                    style={{
                                      border:
                                        !formData.ccv.trim() && buttonClicked
                                          ? "1px solid red"
                                          : "1px solid #ccc",
                                    }}
                                    className={styles.input}
                                    placeholder="123"
                                  />
                                </div>
                              </div>

                              <div className={styles.child}>
                                <label className={styles.label}>
                                  Parcelas:
                                </label>
                                <select
                                  name="pacelas"
                                  onChange={handleChange}
                                  value={formData.installmentCount} // Definindo o valor do select
                                  className={styles.select}
                                >
                                  <option value="1">
                                    1 x de {getTotal.totalAmount / 1}
                                  </option>
                                  <option value="2">
                                    2 x de {getTotal.totalAmount / 2}
                                  </option>
                                  <option value="3">
                                    3 x de {getTotal.totalAmount / 3}
                                  </option>
                                  <option value="4">
                                    4 x de {getTotal.totalAmount / 4}
                                  </option>
                                  <option value="5">
                                    5 x de {getTotal.totalAmount / 5}
                                  </option>
                                  <option value="6">
                                    6 x de {getTotal.totalAmount / 6}
                                  </option>
                                  <option value="7">
                                    7 x de {getTotal.totalAmount / 7}
                                  </option>
                                  <option value="8">
                                    8 x de {getTotal.totalAmount / 8}
                                  </option>
                                  <option value="9">
                                    9 x de {getTotal.totalAmount / 9}
                                  </option>
                                  <option value="10">
                                    10 x de {getTotal.totalAmount / 10}
                                  </option>
                                  <option value="11">
                                    11 x de {getTotal.totalAmount / 11}
                                  </option>
                                  <option value="12">
                                    12 x de {getTotal.totalAmount / 12}
                                  </option>
                                </select>
                              </div>

                              <button
                                type="submit"
                                className={styles.ButtonDataCustomer}
                              >
                                Finalisar Compra
                              </button>
                            </form> */}

<button
                          onClick={handleCreditCardPaymentLink}
                          className={styles.ButtonDataCustomer}
                        >
                          Pagar com Cartão de credito
                        </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div id="div2">
            <p>
              <div>
                {paymentMethod === "cartao" && (
                  <>
                    <div
                      style={{
                        marginTop: "15rem",
                      }}
                    >
                      <a href="https://imgbb.com/">
                        <img
                          src="https://i.ibb.co/Zcn8dp8/verified.png"
                          alt="icone de verificado"
                          border="0"
                        />
                      </a>{" "}
                      pagamento comfirmado
                    </div>
                  </>
                )}

                {paymentMethod === "pix" && (
                  <p>
                    <span className={styles.labelPIX}>
                      Pagar Com PIX QR Code
                    </span>
                    <div className={styles.EXpixCodeContainer}>
                      {encodedImage && (
                        <ImageComponent encodedImage={encodedImage} />
                      )}
                      {encodedImage && (
                        <div className={styles.pixCodeContainer}>
                          <p className={styles.pixCodeContainer___p}>
                            {pixCode}
                          </p>
                          <div>
                            <button
                              onClick={handleClick}
                              className={styles.pixCodeContainer___button}
                            >
                              {status === "copiar" ? "Copiar" : "Copiado"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </p>
                )}

              </div>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pay;
