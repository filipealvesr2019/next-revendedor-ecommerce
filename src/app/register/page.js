"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";

import styles from "./RegisterLink.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "@/components/Header/Header";
import Navbar from "@/components/Navbar/Navbar";
import { useConfig } from "../../../context/ConfigContext";


const RegisterLink = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { apiUrl } = useConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = { email, password, role: "customer" };
      await axios.post(`${apiUrl}/register/request`, newUser);
      
      // Limpar o formulário após o envio bem-sucedido
      setEmail("");
      setPassword("");
      setError("");
      
      // Exibir mensagem de sucesso
      toast.success("Email enviado com sucesso! Verifique sua caixa de email.");
      
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Email já cadastrado
        toast.error("Este email já está cadastrado. Por favor, use outro email.");
      } else {
        // Outro erro
        toast.error("Ocorreu um erro ao enviar o email. Tente novamente.");
      }
      setError(err.response?.data.message || "Ocorreu um erro.");
    }
  };

  return (
    <>
      <Header />
      <Navbar />
      {/* <Helmet>
        <title>Cadastro de usuário  - Loja Mediewal</title>
        <meta name="description" content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos." />
      </Helmet> */}
      <div className={styles.formContainer}>
        <h1 className={styles.formContainer__h1}>Digite seu email</h1>

        
        <form onSubmit={handleSubmit} className={styles.formContainer__form}>
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
          <label className={styles.formContainer__label}>Email:</label>
          <div className={styles.formContainer__div}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.formContainer__input}
              placeholder="email@exemplo.com"
            />
            <button type="submit" className={styles.formContainer__button}>Enviar</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RegisterLink;
