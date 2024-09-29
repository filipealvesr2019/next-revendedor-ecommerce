import React, { useEffect, useState } from "react";

import "./LoginForm.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { useAuth } from "../../../context/AuthContext";
import ProfileDetails from "../ProfileDetails/ProfileDetails";
import Header from "../Header/Header";
import Navbar from "../Navbar/Navbar";
import Link from "next/link";
const LoginForm = () => {
  const { loggedIn, isCustomer, login, remainingAttempts } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar a visibilidade da senha
  const [attemptedLogin, setAttemptedLogin] = useState(false);
  const [hideMessage, setHideMessage] = useState(false);

  const handleLogin = () => {
    setAttemptedLogin(true);
    if (validateForm()) {
      login(email, password);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Campo obrigatório";
    }

    if (!password.trim()) {
      errors.password = "Campo obrigatório";
    }
    setHideMessage(true);
    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  if (loggedIn) {
    return (
      <div className="logout-container">
        {isCustomer ? <ProfileDetails /> : null}
      </div>
    );
  }
 
  return (
    <>
      <Header />
      {/* <Helmet>
        <title>Página de Login- Loja Mediewal</title>
        <meta
          name="description"
          content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
        />
      </Helmet> */}
      <div>
        <div className="loginStyle">
          <h1 className="Login">Login</h1>

          {attemptedLogin && remainingAttempts !== null && (
            <div>
              Tentativas restantes:{" "}
              <span style={{ color: "blue" }}>{remainingAttempts} </span> Depois
              disso você será bloqueado por 30 minutos.
            </div>
          )}
          <div className="loginStyle__inputLabel">
            <label className="email" htmlFor="email">
              Email
            </label>
            <input
              type="text"
              placeholder="Digite o email..."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormErrors((prevErrors) => ({ ...prevErrors, email: "" }));
              }}
              className={formErrors.email ? "error" : ""}
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
            <br />
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label className="password" htmlFor="password">
                Senha
              </label>
              <input
                type={showPassword ? "text" : "password"} // Usa showPassword para alternar o tipo de input
                placeholder="Digite a senha..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    password: "",
                  }));
                }}
                className={formErrors.password ? "error" : ""}
              />
              <div
                onClick={() => setShowPassword(!showPassword)} // Alterna o estado de showPassword
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "70%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </div>
            </div>

            <div className="loginStyle__button">
              {formErrors.password && (
                <span className="error-message">{formErrors.password}</span>
              )}

              <button className="loginButton" onClick={handleLogin}>
                Login
              </button>
              <div className="loginStyle__links">
                <span className="span">
                  {" "}
                  Ainda nao tem uma conta{" "}
                  <Link href={"/register"}>Cadastre-se</Link>
                </span>
                <span className="span">
                  {" "}
                  Esqueceu a senha{" "}
                  <Link href={"/forgotPassword"}>clique aqui</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Navbar />
    </>
  );
};

export default LoginForm;
