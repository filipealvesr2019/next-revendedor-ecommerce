import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios"; // Corrigindo a importação do Axios
import styles from "./AlertComponente.module.css";
import { useAuth } from "../../../context/AuthContext";
import { useUnreadCount } from "../../../context/UnreadContext";
import { useConfig } from "../../../context/ConfigContext";
const AlertComponente = () => {
  const userId = Cookies.get("userId");
  const { logout, loggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const { updateUnreadCount } = useUnreadCount(); // Obter função para atualizar o estado do contexto

  const [boletos, setBoletos] = useState([]);
  const [pix, setPix] = useState([]);
  const [creditCard, setCreditCard] = useState([]);

  const token = Cookies.get("token"); // Obtenha o token do cookie
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const { apiUrl } = useConfig();
 

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [panel]: newExpanded ? panel : false,
    }));
  };
  useEffect(() => {
    if (loggedIn) {
      axios
        .get(`${apiUrl}/api/orders/${userId}`)
        .then((response) => {
          setOrders(response.data);
          console.log(response.data);
          const newOrders = response.data.filter(
            (order) => order.payment.status !== "RECEIVED"
          );
          updateUnreadCount(newOrders.length); // Atualizar o estado do contexto
        })

        .catch((error) => {
          console.error("Erro ao obter os pedidos:", error);
        });
    }
  }, [loggedIn, userId]);

  useEffect(() => {
    if (loggedIn) {
      axios
        .get(`${apiUrl}/api/allOrders/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
     
          },
        })
        .then((response) => {
          setBoletos(response.data.boleto);
          setPix(response.data.pix);
          setCreditCard(response.data.creditCard);
        })
        .catch((error) => {
          console.error("Erro ao obter os pedidos:", error);
        });
    }
  }, [loggedIn, userId]);

  return (
    //     border-top: 1px solid rgb(206, 212, 218);
    <div className={styles.ordersContainer}>
      <div>
        {boletos &&
          boletos.map((order, index) => (
            <>
              {order.trackingCode && (
                <div key={index}>
                  <div>
                    {order.products.slice(0, 1).map((product, prodIndex) => (
                      <div key={prodIndex}>
                        <Link to={`/order/${order.custumerId}/${order._id}`}>
                          produto
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div>
                    <span>código de rastreio</span>

                    <div>{order.trackingCode}</div>
                  </div>
                </div>
              )}
            </>
          ))}

        {pix &&
          pix.map((order, index) => (
            <>
              {order.trackingCode && (
                <div key={index}>
                  <div style={{}}>
                    {order.products.slice(0, 1).map((product, prodIndex) => (
                      <div
                        key={prodIndex}
                        style={{
                          marginBottom: "10rem",
                        }}
                      >
                        <Link to={`/order/${order.custumerId}/${order._id}`}>
                          produto
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div>
                    <span>código de rastreio</span>
                    <div>{order.trackingCode}</div>
                  </div>
                </div>
              )}
            </>
          ))}

        {creditCard &&
          creditCard.slice(0, 1).map((order, index) => (
            <>
              {order.trackingCode && (
                <div key={index}>
                  <div>
                    {order.products.slice(0, 1).map((product, prodIndex) => (
                      <div key={prodIndex}>
                        <Link href={`/order/${order.custumerId}/${order._id}`}>
                          produto
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div>
                      <span>código de rastreio</span>
                      <span>{order.trackingCode}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ))}
      </div>
      {orders &&
        orders.map((order, index) => (
          <div key={index} className={styles.ordersContent}>
            <p style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              {order.payment.billingType === "PIX" && (
                <img
                  src="https://i.ibb.co/dfvK4s0/icons8-foto-48.png"
                  alt="icone do pix"
                  style={{
                    maxWidth: "14vw",
                  }}
                />
              )}
              {order.payment.billingType === "BOLETO" && (
                <img
                  src="https://i.ibb.co/LNrSsZt/icons8-boleto-bankario-48.png"
                  alt="icone do boleto"
                  style={{ maxWidth: "14vw" }}
                />
              )}

              {order.payment.billingType === "CREDIT_CARD" && (
                <img
                  src="https://i.ibb.co/HtWhHR0/icons8-emoji-de-cart-o-de-cr-dito-48.png"
                  alt="Cartão de Crédito"
                />
              )}
              {order.payment.billingType && ""}
              {order.payment.billingType === "CREDIT_CARD"
                ? "Cartão de Crédito"
                : order.payment.billingType}
            </p>
            <p>
              {order.payment.value && "valor: R$"}{" "}
              {order.payment.value && order.payment.value}
            </p>
            <p>
              {order.payment.installmentNumber && "parcela: "}{" "}
              {order.payment.installmentNumber &&
                order.payment.installmentNumber}
            </p>

            <p
              className={`${styles.status} ${
                styles[order.payment.status.toLowerCase()]
              }`}
            >
              <span style={{ color: "black" }}> status: </span>
              {(() => {
                switch (order.payment.status) {
                  case "RECEIVED":
                    return "pago";
                  case "CONFIRMED":
                    return "Cobrança confirmada";
                  case "PENDING":
                    return "Pendente";
                  case "OVERDUE":
                    return "Cobrança vencida";
                  default:
                    return;
                }
              })()}
            </p>
          </div>
        ))}
    </div>
  );
};

export default AlertComponente;
