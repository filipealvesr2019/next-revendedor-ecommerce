 "use client"
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  // useEffect para inicializar cartItemCount a partir do localStorage no cliente
  useEffect(() => {
    const storedCartItemCount = localStorage.getItem("cartItemCount");
    if (storedCartItemCount !== null) {
      setCartItemCount(Number(storedCartItemCount));
    }
  }, []); // O array vazio garante que isso ocorra apenas uma vez após o primeiro render

  // useEffect para atualizar localStorage sempre que cartItemCount mudar
  useEffect(() => {
    localStorage.setItem("cartItemCount", cartItemCount);
  }, [cartItemCount]);

  const addToCart = () => {
    setCartItemCount((prevCount) => prevCount + 1);
  };

  const removeFromCart = () => {
    setCartItemCount((prevCount) => Math.max(prevCount - 1, 0));
  };

  const clearCart = () => {
    setCartItemCount(0); // Reseta o contador para zero
    localStorage.removeItem("cartItemCount");
  };

  return (
    <CartContext.Provider value={{ cartItemCount, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
