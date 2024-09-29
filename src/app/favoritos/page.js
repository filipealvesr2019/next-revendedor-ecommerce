"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

import styles from "./Heart.module.css"; // Importa o módulo CSS
import Link from "next/link";
import Header from "@/components/Header/Header";
import Navbar from "@/components/Navbar/Navbar";
import { useConfig } from "../../../context/ConfigContext";
import { useAuth } from "../../../context/AuthContext";
import { Login } from "@mui/icons-material";
import LoginForm from "@/components/Login/LoginForm";

const Heart = () => {
  const [favorites, setFavorites] = useState([]);

  const userId = Cookies.get("userId");
  const { logout, loggedIn } = useAuth();
  const credentials = Cookies.get("role");
  const token = Cookies.get("token");
  const { apiUrl } = useConfig();

  useEffect(() => {
    if (loggedIn) {
      axios
        .get(`${apiUrl}/api/favorites/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Credentials: credentials,
          },
        })
        .then((response) => {
          setFavorites(response.data.favorites);
        })
        .catch((error) => {
          console.error("Erro ao visualizar produtos favoritos:", error);
        });
    }
  }, [loggedIn, userId]);

  const charLimit = 24;
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
    <div className={styles.HeartContainer}>
      <Header />

      <Navbar />
      {!loggedIn ? (
        <>
          {" "}
          <LoginForm></LoginForm>
        </>
      ) : (
        <>
          <ul className={styles.HeartUL}>
            {favorites.map((favorite) => (
              <div key={favorite._id} className={styles.Heartfavorite}>
                <Link
                  href={`/products/${removeAccents(favorite.name)}/${
                    favorite._id
                  }`}
                  className={styles.HeartLink}
                >
                  <img
                    src={favorite.variations[0].urls[0]}
                    alt="icone dos fovoritos"
                    className={styles.HeartIMG}
                  />
                  <li className={styles.Name}>
                    {favorite.name.length > charLimit
                      ? favorite.name.substring(0, charLimit) + "..."
                      : favorite.name}
                  </li>
                </Link>
              </div>
            ))}
          </ul>
        </>
      )}
      {/* <Helmet>
        <title>Página de Favoritos - Loja Mediewal</title>
        <meta
          name="description"
          content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
        />
      </Helmet> */}
    </div>
  );
};

export default Heart;
