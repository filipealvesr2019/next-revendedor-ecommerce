"use client"
import React, { useEffect, useState } from "react";

import Cookies from "js-cookie";
import axios from "axios";
import { Pagination, Stack } from "@mui/material";
import styles from "./MyOrders.module.css";
import { useAuth } from "../../../context/AuthContext";
import { useConfig } from "../../../context/ConfigContext";
import Header from "@/components/Header/Header";
import Navbar from "@/components/Navbar/Navbar";
import Link from "next/link";
import CircularIndeterminate from "@/components/CircularIndeterminate/CircularIndeterminate";

const MyOrders = () => {
  const userId = Cookies.get("userId");
  const { logout, loggedIn } = useAuth();
  const [boletos, setBoletos] = useState([]);
  const [pix, setPix] = useState([]);
  const [creditCard, setCreditCard] = useState([]);
  const credentials = Cookies.get('role');
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const token = Cookies.get('token');
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
        .get(`${apiUrl}/api/allOrders/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Credentials: credentials,
          },
          params: { page: currentPage, pageSize },
        })
        .then((response) => {
          setBoletos(response.data.boleto);
          setPix(response.data.pix);
          setCreditCard(response.data.creditCard);
          setTotalOrders(response.data.totalOrders);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao obter os pedidos:", error);
        });
    }
  }, [loggedIn, userId, currentPage, pageSize]);

  const handleClick = (payload) => {
    navigator.clipboard.writeText(payload);
  };
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const tabStyle = {
    color: "#ccc",
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };


  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses são baseados em zero
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
          <CircularIndeterminate />;
        </div>
      ) : (
        <>

          <div className={styles.EXdataContainer}
          >
            <div className={styles.h1Container}>
              <h1 className={styles.h1}>MEUS PEDIDOS</h1>
            </div>

            {[...boletos, ...pix, ...creditCard].map((order, index) => (
              <div
                key={index}
                className={styles.dataContainer}
              >

                <div className={styles.dataContainer__Child}>

                  <div >
                    {order.products.slice(0, 1).map((product, prodIndex) => (
                      <div
                        key={prodIndex}

                      >
                        <Link href={`/orderDetails/${order.custumerId}/${order._id}`} style={{
                          textDecoration: 'none',
                        }} >
                          <img
                            src={product.image}
                            alt={`Produto ${product.productId}`}
                            className={styles.dataContainer__img}
                          />
                        </Link>

                      </div>
                    ))}
                  </div>
                  <div

                  >
                     <Link href={`/orderDetails/${order.custumerId}/${order._id}`} style={{
                          textDecoration: 'none',
                        }} >
                    {" "}
                    <div className={styles.flex}>
                      <span className={styles.textStyle}>{order.billingType === "CREDIT_CARD" ? "  CARTÃO DE CREDITO" : order.billingType}</span>
                      <span className={styles.value}>R${order.value}</span>{" "}

                    </div>

                    <div className={styles.flex}>
                      <span className={styles.textStyle}>Data do Pedido: </span>
                      <span className={styles.textStyle}>{order.expirationDate ? formatDate(order.expirationDate) : formatDate(order.dueDate)}</span>

                    </div>

                    <div
                      className={styles.flex}
                    >
                      <span className={styles.textStyle}>Status</span>
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
                    </Link>
                    <div
                      className={styles.flex}
                    >
                      <a href="https://www.kangu.com.br/rastreio/" target="_blank">
                        <span>Rastrear Pedido</span>
                      </a>
                      <span>{order.trackingCode}</span>
                    </div>
                  </div>

                  <div

                  ></div>



                </div>

              </div>

            ))}


          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "2rem",
            }}
            className={styles.paginationContainer}
          >

            <Stack spacing={2}>
              <Pagination
                count={Math.ceil(totalOrders / pageSize)}
                variant="outlined"
                color="primary"
                size="large"
                page={currentPage}
                onChange={handlePageChange}
              />
            </Stack>
          </div>
        </>
      )}
    </>
  );
};

export default MyOrders;