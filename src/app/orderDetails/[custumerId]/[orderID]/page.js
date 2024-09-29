 "use client"
import React, { useEffect, useState } from "react";

import Cookies from "js-cookie";
import axios from "axios";
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import styles from "./AllOrderDetails.module.css"
import Header from "@/components/Header/Header";
import Navbar from "@/components/Navbar/Navbar";
import QRCODE from "@/components/QRCODE/QRCode";
import CircularIndeterminate from "@/components/CircularIndeterminate/CircularIndeterminate";
import { useConfig } from "../../../../../context/ConfigContext";
import { useAuth } from "../../../../../context/AuthContext";
import Link from "next/link";

const AllOrderDetails = ({params}) => {
    const { orderID } = params; // Extracting query from URL

  const userId = Cookies.get("userId");
  const { logout, loggedIn } = useAuth();
  const [boletos, setBoletos] = useState([]);
  const [pix, setPix] = useState([]);
  const [creditCard, setCreditCard] = useState([]);

  const [payload, setPayload] = useState(false);

  const [expanded, setExpanded] = useState({});
  const [maxLength, setMaxLength] = useState(10); // Inicialize com um valor padrão
  const token = Cookies.get('token'); // Obtenha o token do cookie
  const [loading, setLoading] = useState(true);
  const { apiUrl } = useConfig();

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [panel]: newExpanded ? panel : false,
    }));
  };
console.log(orderID)
  useEffect(() => {
    setLoading(true); // Define o estado de carregamento como true antes de fazer a chamada à API

    if (loggedIn) {
      axios
        .get(`${apiUrl}/api/allOrders/${userId}/${orderID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,

            },
          })
        .then((response) => {
          setBoletos(response.data.boleto);
          setPix(response.data.pix);
          setCreditCard(response.data.creditCard);
          setLoading(false); // Define o estado de carregamento como true antes de fazer a chamada à API
          console.log(response.data.boleto)
        })
        .catch((error) => {
          console.error("Erro ao obter os pedidos:", error);
        });
    }
  }, [loggedIn, userId]);

  const handleClick = (payload) => {
    navigator.clipboard.writeText(payload);
    setPayload(payload)
  };




  useEffect(() => {
    // Lógica para definir maxLength dinamicamente
    const updateMaxLength = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 600) {
        setMaxLength(20); // Exemplo: define maxLength para 15 em telas menores que 768px
      } else if (screenWidth > 700) {
        setMaxLength(35); // Exemplo: define maxLength para 30 em telas maiores ou iguais a 768px
      }
    };

    // Chama a função ao carregar a página e redimensionar a janela
    updateMaxLength();
    window.addEventListener('resize', updateMaxLength);

    // Limpa o event listener quando o componente é desmontado
    return () => {
      window.removeEventListener('resize', updateMaxLength);
    };
  }, []);


  const truncateName = (name) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength) + '...';
    }
    return name;
  };


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
    <>
      <Header />
      <Navbar />
      {/* <Helmet>
        <title>Histórico de Compras - Loja Mediewal</title>
        <meta
          name="description"
          content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
        />
      </Helmet> */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20rem",
          }}
        >
          <CircularIndeterminate />
        </div>
      ) : (<>

        {boletos &&
          boletos.map((order, index) => (
            <div
              key={index}
              className={styles.boletoContainer}
            >
              <div className={styles.TotalAmountContainer}>




                <div className={styles.justifyContent}>
                  <span className={styles.span}>Tipo</span>
                  {order.shippingFeeData.shippingFeePrice ? <span className={styles.span}>Valor da entrega</span> : ""}

                  <span className={styles.span}>Total do pedido</span>


                  <span className={styles.span}>Quantidade total</span>
                  {order.trackingCode ? <a href="https://www.kangu.com.br/rastreio/" target="_blank" className={styles.span} style={{}} >
                    Rastrear Pedido
                  </a> : ""}

                  <span className={styles.span}>Status</span>
                </div>
                <div className={styles.justifyContent}>
                  <span className={styles.span}>{order.billingType}</span>
                  {order.shippingFeeData.shippingFeePrice ? <span className={styles.span}>R$ {order.shippingFeeData.shippingFeePrice}</span> : ""}

                  <span className={styles.value}>R$ {order.value}</span>




                  <span className={styles.span}>{order.totalQuantity} unidades</span>


                  {order.trackingCode ? <span className={styles.span}>{order.trackingCode}</span> : ""
                  }



                  <span className={`${styles.status} ${styles[order.status.toLowerCase()]
                    }`}>
                    {" "}
                    {(() => {
                      switch (order.status) {
                        case "RECEIVED":
                          return "PAGO";
                        case "CONFIRMED":
                          return "COBRANÇA CONFIMADA";
                        case "PENDING":
                          return "PENDENTE";
                        case "OVERDUE":
                          return "COBRANÇA VENCIDA";
                        default:
                          return;
                      }
                    })()}
                  </span>

                </div>



              </div>
              {order.status === "PENDING" ? (

                <div className={styles.boletoContainer__buttonContainer}>
                  <Link href={order.bankSlipUrl} style={{ textDecoration: "none" }}>
                    {" "}
                    <button className={styles.boletoContainer__button}>Pagar boleto</button>{" "}
                  </Link>
                  <div className={styles.boletoContainer__span}>
                    <WatchLaterOutlinedIcon />
                    <span >
                      Este Boleto expira em
                      24 horas</span>
                  </div>



                </div>


              ) : (
                ""
              )}


              <div>
                {order.products.map((product, prodIndex) => (
                  <>
                    <Link href={`/products/${removeAccents(product.name)}/${product.productId}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div key={prodIndex} className={styles.boletoContainer__card}>
                        <img
                          src={product.image}
                          alt={`Produto ${product.productId}`}
                          className={styles.boletoContainer__img}
                        />
                        <div className={styles.boletoContainer__text}>

                          <span className={styles.text}>{truncateName(product.name)}</span>

                          <span className={styles.text}>Tamanho: {product.size}</span>



                          <span className={styles.text}>Quantidade: {product.quantity}</span>


                        </div >
                        <div>                      <span className={styles.value}>R$ {product.price && product.price}</span>
                        </div>

                      </div>


                    </Link>

                  </>
                ))}
              </div>







            </div>
          ))}
        {pix &&
          pix.map((order, index) => (
            <div>

              <div
                key={index}
                className={styles.boletoContainer}
              >
                <div className={styles.TotalAmountContainer}>




                  <div className={styles.justifyContent}>
                    <span className={styles.span}>Tipo</span>
                    {order.shippingFeeData.shippingFeePrice && <span className={styles.span}>Valor da entrega</span>}

                    <span className={styles.span}>Total do pedido
                    </span>

                    <span className={styles.span}>Quantidade total</span>
                    {order.trackingCode ? <a href="https://www.kangu.com.br/rastreio/" target="_blank" className={styles.span} >
                      Rastrear Pedido
                    </a> : ""}

                    <span className={styles.span}>Status</span>
                  </div>
                  <div className={styles.justifyContent}>
                    <span className={styles.span}>{order.billingType}</span>

                    {order.shippingFeeData.shippingFeePrice && <span className={styles.span}> R$ {order.shippingFeeData.shippingFeePrice}</span>
                    }

                    <span className={styles.value}>R$ {order.value}</span>

                    <span className={styles.span}>{order.totalQuantity} unidades</span>


                    {order.trackingCode ? <span className={styles.span}>{order.trackingCode}</span> : ""
                    }


                    <span className={`${styles.status} ${styles[order.status.toLowerCase()]
                      }`}>
                      {" "}
                      {(() => {
                        switch (order.status) {
                          case "RECEIVED":
                            return "PAGO";
                          case "CONFIRMED":
                            return "COBRANÇA CONFIMADA";
                          case "PENDING":
                            return "PENDENTE";
                          case "OVERDUE":
                            return "COBRANÇA VENCIDA";
                          default:
                            return;
                        }
                      })()}
                    </span>

                  </div>



                </div>
                {order.status === "PENDING" ? (

                  <div >
                    {order.status === "PENDING" ? (
                      <div className={styles.pixCodeContainer}>
                        {order.encodedImage && (
                          <QRCODE encodedImage={order.encodedImage} className={styles.pixCodeContainer___encodedImage} />
                        )}
                        {order.encodedImage && (
                          <div className={styles.pixCodeContainer___Container} >
                            <p className={styles.pixCodeContainer___p}>{order.payload}</p>
                            <div>
                              <button onClick={() => handleClick(order.payload)} className={styles.pixCodeContainer___button}>
                                {payload ? "Copiado" : "Copiar"}
                              </button>
                            </div>
                            <div className={styles.pixCodeContainer__span}>
                              <WatchLaterOutlinedIcon />
                              <span >
                                Este Boleto expira em
                                24 horas</span>
                            </div>

                          </div>
                        )}
                      </div>
                    ) : (
                      ""
                    )}



                  </div>


                ) : (
                  ""
                )}


                <div>
                  {order.products.map((product, prodIndex) => (
                    <>
                      <Link href={`/products/${removeAccents(product.name)}/${product.productId}`} style={{ textDecoration: "none", color: "inherit" }}>

                        <div key={prodIndex} className={styles.boletoContainer__card}>
                          <img
                            src={product.image}
                            alt={`Produto ${product.productId}`}
                            className={styles.boletoContainer__img}
                          />
                          <div className={styles.boletoContainer__text}>

                            <span className={styles.text}>{truncateName(product.name)}</span>

                            <span className={styles.text}>Tamanho: {product.size}</span>



                            <span className={styles.text}>Quantidade: {product.quantity}</span>


                          </div >
                          <div>                      <span className={styles.value}>R$ {product.price && product.price}</span>
                          </div>

                        </div>

                      </Link>
                    </>
                  ))}
                </div>







              </div>


            </div>
          ))}

        {creditCard &&
          creditCard.map((order, index) => (
            <div
              key={index}
              className={styles.boletoContainer}
            >
              <div className={styles.TotalAmountContainer}>




                <div className={styles.justifyContent}>
                  <span className={styles.span}>Tipo</span>
                  {order.shippingFeeData.shippingFeePrice ? <span className={styles.span}>Valor da entrega</span> : ""}

                  <span className={styles.span}>Total do pedido</span>


                  <span className={styles.span}>Quantidade total</span>
                  {order.trackingCode ? <a href="https://www.kangu.com.br/rastreio/" target="_blank" className={styles.span} style={{}} >
                    Rastrear Pedido
                  </a> : ""}

                  <span className={styles.span}>Status</span>
                </div>
                <div className={styles.justifyContent}>
                  
                <span className={styles.span}>{order.billingType === "CREDIT_CARD" && "Cartão de Credito"}</span>
                {order.shippingFeeData.shippingFeePrice ? <span className={styles.span}>R$ {order.shippingFeeData.shippingFeePrice}</span> : ""}

                  <span className={styles.value}>R$ {order.value}</span>




                  <span className={styles.span}>{order.totalQuantity} unidades</span>


                  {order.trackingCode ? <span className={styles.span}>{order.trackingCode}</span> : ""
                  }



                  <span className={`${styles.status} ${styles[order.status.toLowerCase()]
                    }`}>
                    {" "}
                    {(() => {
                      switch (order.status) {
                        case "RECEIVED":
                          return "PAGO";
                        case "CONFIRMED":
                          return "COBRANÇA CONFIMADA";
                        case "PENDING":
                          return "PENDENTE";
                        case "OVERDUE":
                          return "COBRANÇA VENCIDA";
                        default:
                          return;
                      }
                    })()}
                  </span>

                </div>



              </div>
              {order.status === "PENDING" ? (

                <div className={styles.boletoContainer__buttonContainer}>
                  <Link href={order.invoiceUrl} style={{ textDecoration: "none" }}>
                    {" "}
                    <button className={styles.boletoContainer__button}>Pagar agora</button>{" "}
                  </Link>
                  <div className={styles.boletoContainer__span}>
                    <WatchLaterOutlinedIcon />
                    <span >
                      Esta pagina de pagamento expira em
                      24 horas</span>
                  </div>



                </div>


              ) : (
                ""
              )}


              <div>
                {order.products.map((product, prodIndex) => (
                  <>
                    <Link href={`/products/${removeAccents(product.name)}/${product.productId}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div key={prodIndex} className={styles.boletoContainer__card}>
                        <img
                          src={product.image}
                          alt={`Produto ${product.productId}`}
                          className={styles.boletoContainer__img}
                        />
                        <div className={styles.boletoContainer__text}>

                          <span className={styles.text}>{truncateName(product.name)}</span>

                          <span className={styles.text}>Tamanho: {product.size}</span>



                          <span className={styles.text}>Quantidade: {product.quantity}</span>


                        </div >
                        <div>                      <span className={styles.value}>R$ {product.price && product.price}</span>
                        </div>

                      </div>


                    </Link>

                  </>
                ))}
              </div>







            </div>
          ))}



      </>)}

    </>
  );
};

export default AllOrderDetails;
