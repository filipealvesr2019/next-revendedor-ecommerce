 "use client"
import React, { useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";
// import CategoriesList from "./CategoriesList";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import axios from "axios";
import Cookies from "js-cookie";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";

import SearchBar from "../../app/SearchBar/SearchBar";

import { useAuth } from "../../../context/AuthContext";
import AlertComponente from "../AlertComponente/AlertComponente";
import { useUnreadCount } from "../../../context/UnreadContext";
import { useConfig } from "../../../context/ConfigContext";
import { useCart } from "../../../context/CartContext";
import Link from "next/link";
const Header = () => {
  const { cartItemCount, addToCart, removeFromCart } = useCart();
  const [localCartItemCount, setLocalCartItemCount] = useState(0);
  const userId = Cookies.get("userId"); // Obtenha o token do cookie
  const [showButton, setShowButton] = useState(false);

  const { logout, loggedIn } = useAuth(); // Obtendo o userId do contexto de autenticação
  const token = Cookies.get("token"); // Obtenha o token do cookie
  const modalRef = useRef(null);
  const [openCartModal, setOpenCartModal] = useState(false);
  const [openBellModal, setOpenBellModal] = useState(false);
  const { apiUrl } = useConfig();

  const { unreadCount } = useUnreadCount(); // Obter o estado do contexto
  const [showInput, setShowInput] = useState(false);
  
  useEffect(() => {
    const storedCartItemCount = localStorage.getItem("cartItemCount");
    if (storedCartItemCount !== null) {
        setLocalCartItemCount(Number(storedCartItemCount));
    }
}, []);


  useEffect(() => {
    if (loggedIn) {
      axios
        .get(`${apiUrl}/api/cart/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setLocalCartItemCount(
            Math.max(response.data.cart.TotalQuantity, 0)
          );
        })
        .catch((error) => {
          console.error(
            "Erro ao obter o número de produtos no carrinho:",
            error
          );
        });
    } else {
      setLocalCartItemCount(cartItemCount);
    }
  }, [loggedIn, userId, cartItemCount]);

  useEffect(() => {
    localStorage.setItem("cartItemCount", localCartItemCount);
  }, [localCartItemCount]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        (openCartModal || openBellModal || showInput) // Só fecha se um dos modais estiver aberto
      ) {
        setOpenCartModal(false);
        setOpenBellModal(false);
        setShowInput(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openCartModal, openBellModal, showInput]); // Adicionei openCartModal e openBellModal como dependências

  const handleClickOpenModal = () => {
    setOpenCartModal(true);
  };

  const handleClickCloseModal = () => {
    setOpenCartModal(false);
  };

  const handleOpenModalAccount = () => {
    // Verifica se o tamanho e a cor estão selecionados

    handleClickOpenModal();
  };

  // modal do sino

  const handleClickOpenBellModal = () => {
    setOpenBellModal(true);
  };

  const handleClickCloseBellModal = () => {
    setOpenBellModal(false);
  };

  const handleOpenBellModal = () => {
    // Verifica se o tamanho e a cor estão selecionados

    handleClickOpenBellModal();
  };

  useEffect(() => {
    if (loggedIn) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  });

  const handleClickCloseInputModal = () => {
    setShowInput(false);
  };
  const handleClickOpenInputModal = () => {
    setShowInput(true);
  };

  const handleOpenInput = () => {
    handleClickOpenInputModal();
  };
  return (
    <>
    
      <div className={styles.ContainerHeader}>
 
          <div className={styles.desktopContainer}>
            
            <div className={styles.child}>
              <i>
                <Link href={"/"}>
                  <img
                    src="https://i.ibb.co/B3xYDzG/Logo-mediewal-1.png"
                    alt="Logo da Mediewal"
                    className={styles.MediewalLogo}
                  />
                </Link>
              </i>
            </div>

              
            {/* Componente SearchBar à direita */}
            <div className={styles.SearchBar}>
              <SearchBar />
            </div>     
       
            <div>
              {openBellModal && loggedIn === true && (
                <div className={styles.HeaderModal}>
                  <div ref={modalRef} className={styles.BellModalContent}>
                    <div className={styles.FirstContainer}>
                      <h4 className={styles.h4}>Alertas</h4>
                    </div>

                    {showButton && (
                      <>
                        <div className={styles.scroll}>
                          <AlertComponente />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {openCartModal && loggedIn === true && (
                <div className={styles.HeaderModal}>
                  <div ref={modalRef} className={styles.HeaderModalContent}>
                    {showButton && (
                      <>
                        <div className={styles.FirstContainer}>
                          <h4 className={styles.h4}>Configurações</h4>
                        </div>
                        <nav className={styles.NavContainer}>
                          <ul style={{ listStyleType: "none" }}>
                            <li className={styles.li}>
                              <Link
                                href={"/perfil"}
                                style={{ textDecoration: "none" }}
                                
                              >
                                <span
                                  style={{
                                    textDecoration: "none",
                                    color: "rgb(108, 117, 125)",
                                  }}
                                >
                                  Minha Conta
                                </span>
                              </Link>
                            </li>
                            
                            <li className={styles.li}>
                              <Link
                                href={"/orders"}
                                style={{ textDecoration: "none" }}
                              >
                                <span style={{ color: "rgb(108, 117, 125)" }}>
                                  Historico de Compras
                                </span>
                              </Link>
                            </li>
                            <li className={styles.li}>
                              <Link
                                href={"/forgotPassword"}
                                style={{ textDecoration: "none" }}
                              >
                                <span style={{ color: "rgb(108, 117, 125)" }}>
                                  Alterar senha
                                </span>
                              </Link>
                            </li>
                          </ul>
                        </nav>
                 
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            color: "red",
                            bottom: "10px",
                            left: "10px",
                            gap: ".2rem",
                            cursor: "pointer",
                            marginTop:"1rem",
                            marginRight:"4rem"
                          }}
                          onClick={logout}
                        >
                          <LogoutIcon />
                          <span
                            style={{
                              fontSize: "1rem",
                              fontFamily: "poppins",
                              fontWeight: "400",
                            }}
                          >
                            Sair
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.IconsDesktopContainer}>
                <div className={styles.bellContainer}>
                  {loggedIn === true && (
                    <div >
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                          zIndex: "99999",
                        }}
                      >
                        <img
                          src="https://i.ibb.co/98L4Hny/bell-6.png"
                          alt="icone de sino de notificações"
                          style={{ fontSize: "14rem", cursor: "pointer" }}
                          onClick={handleOpenBellModal}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: "-10px",
                            right: "-10px",
                            width: "20px",
                            height: "20px",
                            backgroundColor: "#2196f3",
                            color: "white",
                            borderRadius: "50%",
                            fontSize: "13px",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {unreadCount}{" "}
                          {/* Substituir 0 pelo valor do estado do contexto */}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.IconsContainer}>
                <Link href={loggedIn === true ? " " : "/perfil"}>
                  {" "}
                  <img
                    src="https://i.ibb.co/L1tX6LY/user-2.png"
                    alt="icone de perfil do usuario"
                    onClick={handleOpenModalAccount}
                  />
                </Link>

                <Link href={"/favoritos"}>
                  <img src="https://i.ibb.co/2ZnFQfq/heart-1.png" alt="" />
                </Link>
                
                <Link
                  href={"/cart"}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    zIndex: "99999",
                  }}
                >
                  <img
                    src="https://i.ibb.co/FwNpdzD/shopping-bag-1.png"
                    alt="icone do carrinho de compras"
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-10px",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "red",
                      color: "white",
                      borderRadius: "50%",
                      fontSize: "13px",
                      fontWeight: "bold",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {loggedIn ? localCartItemCount : 0}
                  </span>
                </Link>

                </div>
              
              </div>
            </div>
          </div>
        </div>

        {/* <div
          style={{
            marginTop: "-10rem",
            zIndex: -1, // Define o z-index para 1
            position: "absolute",
          }}
        >
          <CategoriesList />
        </div> */}


 
       


   
      <div className={styles.ContainerHeaderMobile}>

      <div className={styles.MobileHeader__Container}>
            <div>
              <i>
                <Link href={"/"}>
                  <img
                    src="https://i.ibb.co/B3xYDzG/Logo-mediewal-1.png"
                    alt="Logo da Mediewal"
                    className={styles.MediewalLogoMobile}
                  />
                </Link>
              </i>
            </div>

            <div className={styles.MobileHeader__icons}>
              <div className={styles.MobileHeader__SearchIcon}>
              <SearchIcon
                onClick={handleOpenInput}
                style={{ fontSize: "2.1rem" }}
              />
              <div>

              {showInput && (
                <div ref={modalRef} className={styles.SearchBarContent}>
                  <div>
                    <SearchBar />
                  </div>
                </div>
              )}

              </div>

              </div>

 
              <Link
                href={"/favoritos"}
                style={{
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <FavoriteBorderIcon style={{ fontSize: "2rem" }} />
              </Link>

              <Link
                href={"/cart"}
                style={{
                  position: "relative",
                  display: "inline-block",
                  color: "white",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    width: "20px",
                    height: "20px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    fontSize: "13px",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {loggedIn ? localCartItemCount : 0}
                </span>
                <ShoppingBagOutlinedIcon
                  style={{ fontSize: "2rem", color: "white" }}
                />
              </Link>

              </div>
             
            </div>
       

      </div>
    </>
  );
};

export default Header;
