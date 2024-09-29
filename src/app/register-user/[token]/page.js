"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import styles from './Register.module.css';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import { useConfig } from '../../../../context/ConfigContext';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';


function RegisterUser({params}) {
    const { token } = params; // Extracting query from URL

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(null);
  const [containsSpecialCharacter, setContainsSpecialCharacter] = useState(false);
  const [containsNumber, setContainsNumber] = useState(false);
  const [containsCapitalLetter, setContainsCapitalLetter] = useState(false);
  const [containsLowerCase, setContainsLowerCase] = useState(false);
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(true);
  const { apiUrl } = useConfig();

  useEffect(() => {
    // O token agora está disponível aqui, você pode usá-lo como desejar

  }, [token]);

  useEffect(() => {
    // Verifica se todos os critérios estão atendidos
    if (containsSpecialCharacter && containsNumber && containsCapitalLetter && containsLowerCase) {
      setIsAddButtonDisabled(false);
    } else {
      setIsAddButtonDisabled(true);
    }
  }, [containsSpecialCharacter, containsNumber, containsCapitalLetter, containsLowerCase]);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Verifica se há algum caractere especial na senha
    const specialCharacterPattern = /[\\;?-^.!'{:@#$%^&"_(¨¨||/+,.=)_£0}*|<>`]/;
    setContainsSpecialCharacter(specialCharacterPattern.test(newPassword));

    const OneNumber = /[0-9]/;
    setContainsNumber(OneNumber.test(newPassword));

    const OneCapitalLetter = /[A-Z]/;
    setContainsCapitalLetter(OneCapitalLetter.test(newPassword));

    const OneLowerCase = /[a-z]/;
    setContainsLowerCase(OneLowerCase.test(newPassword));
  };

  const role = 'customer'; // Definindo o papel (role) como 'customer' por padrão

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/register-user/${token}`, { email, password, role });
      setMessage(response.data.message);
      toast.success("Usuário registrado com sucesso.");

    } catch (error) {
      setError(error.response.data.error);
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
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <h2 className={styles.h2}>Cadastro</h2>
          <div className={styles.specs}>
            <label className={styles.label}>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
          </div>
        
          <div>
            <label  className={styles.label}>Password:</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={handlePasswordChange} required className={styles.input} />
              <div onClick={() => setShowPassword(!showPassword)} 
              className={styles.VisibilityIcon}
              >
                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </div>
            </div>
          </div>
          <div className={styles.specs}>
            <h4  className={styles.label}>Sua senha precisa conter:</h4>
            <span style={{ color: containsSpecialCharacter ? 'green' : 'black' }} className={styles.span}>
              {containsSpecialCharacter ? <CheckIcon /> : <CloseIcon style={{ color: "#ee0d1f" }} />} 1 caractere especial (\^!@#$%^&*(),.?":{}|)
            </span>
            <span style={{ color: containsCapitalLetter ? 'green' : 'black' }} className={styles.span}>
              {containsCapitalLetter ? <CheckIcon /> : <CloseIcon style={{ color: "#ee0d1f" }} />} 1 letra maiúscula
            </span>
            <span style={{ color: containsLowerCase ? 'green' : 'black' }}   className={styles.span}>
              {containsLowerCase ? <CheckIcon /> : <CloseIcon style={{ color: "#ee0d1f" }} />} 1 letra minúscula
            </span>
            <span style={{ color: containsNumber ? 'green' : 'black' }} className={styles.span}>
              {containsNumber ? <CheckIcon /> : <CloseIcon style={{ color: "#ee0d1f" }} />} 1 número
            </span>
          </div>
          <button type="submit" style={{ backgroundColor: isAddButtonDisabled ? "#ccc" : "#14337C" }} disabled={isAddButtonDisabled} className={styles.formContainer__button}>
            Cadastrar
          </button>
        </form>
      </div>
    </>
  );
}

export default RegisterUser;
