"use client"
import React, { useEffect, useState } from 'react'
import LogoutIcon from "@mui/icons-material/Logout";
import Protected from '@/components/Protected/Protected';
import Header from '@/components/Header/Header';
import { useAuth } from '../../../context/AuthContext';
import LoginForm from '@/components/Login/LoginForm';
;


const Profile = () => {
  const { logout, loggedIn } = useAuth(); // UseAuth hook deve ser chamado antes de qualquer retorno condicional

  if (!loggedIn) {
    return <LoginForm />;
  }

  return (
    <div>
        {/* <Helmet>
        <title>Perfil - Loja Mediewal</title>
        <meta
          name="description"
          content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
        />
      </Helmet> */}
      <Header />
      <div style={{ marginTop: "10rem" }}>
        <Protected isLoggedIn={loggedIn} />
        
      </div>
    </div>
  );
}

export default Profile