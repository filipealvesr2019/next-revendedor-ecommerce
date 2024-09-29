"use client";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useConfig } from "../../../context/ConfigContext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const IconToggle = ({ productId, isFavorite }) => {
  const [active, setActive] = useState(isFavorite ?? false);
  const userId = Cookies.get("userId");
  const { logout, loggedIn } = useAuth();
  const credentials = Cookies.get("role");
  const token = Cookies.get("token");
  const { apiUrl } = useConfig();

  useEffect(() => {
    const storedActive = localStorage.getItem(`favorite_${productId}`);
    if (storedActive !== null) {
      setActive(storedActive === "true");
    } else {
      setActive(isFavorite); // Atualiza o estado inicial com base em `isFavorite`
    }
  }, [productId, isFavorite]);

  const handleClick = async () => {
    try {
      if (!loggedIn || !userId) {
        console.error("Usuário não autenticado.");
        return;
      }

      const response = await fetch(`${apiUrl}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Credentials: credentials,
        },
        body: JSON.stringify({
          custumerId: userId,
          productId: productId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newActive = !active; // Muda o estado após a resposta
        setActive(newActive);
        localStorage.setItem(`favorite_${productId}`, newActive.toString());
      } else {
        console.error("Erro ao adicionar/remover produto dos favoritos");
      }
    } catch (error) {
      console.error("Erro ao adicionar/remover produto dos favoritos:", error);
    }
  };

  return (
    <div style={{ width: "2rem", cursor: "pointer" }} onClick={handleClick}>
      {active ? (
        <FavoriteIcon
          style={{ color: "red", marginBottom: "1rem", zIndex: "99999" }}
        />
      ) : (
        <FavoriteBorderIcon
          style={{ color: "#ccc", marginBottom: "1rem", zIndex: "99999" }}
        />
      )}
    </div>
  );
};

export default IconToggle;
