
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import UpdateForm from "../UpdateForm/UpdateForm";
import SignUpForm from "../SignUpForm/SignUpForm";
import { useConfig } from "../../../context/ConfigContext";

const Protected = () => {
  const [showComponent, setShowComponent] = useState(false);
  const userId = Cookies.get("userId"); // Obtenha o token do cookie

  const token = Cookies.get("token"); // Obtenha o token do cookie
  const { apiUrl } = useConfig();

  useEffect(() => {
    const checkUserRegistration = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/custumer/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.data || response.data.length === 0) {
          setShowComponent(true);
        } else {
          setShowComponent(false);
        }
      } catch (error) {}
    };

    checkUserRegistration();
  }, [userId]);

  return (
    <div>
      {/* <Helmet>
        <title>Perfil - Loja Mediewal</title>
        <meta
          name="description"
          content="Veja as últimas novidades em nossa loja, com uma seleção de produtos novos."
        />
      </Helmet> */}
      {showComponent === true ? (
        <SignUpForm></SignUpForm>
      ) : (
        <UpdateForm></UpdateForm>
      )}
    </div>
  );
};

export default Protected;
