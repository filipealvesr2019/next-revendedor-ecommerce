import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./SignUpForm.module.css"

import { useRouter } from "next/router"; // Importe o useRouter de next/router
import { useConfig } from "../../../context/ConfigContext";
import Header from "../Header/Header";
import Navbar from "../Navbar/Navbar";











const SignUpForm = () => {
  const userId = Cookies.get("userId"); // Obtenha o token do cookie
  const [showCEP, setShowCEP] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [IsCepInvalid, setIsCepInvalid] = useState(false)
  const [formData, setFormData] = useState({
    custumerId: userId, // Usando o userId do usuário logado
    name: "",
    cpfCnpj: "",
    email: "",
    mobilePhone: "",
    postalCode: "",
    address: "",
    addressNumber: "",
    complement: "",
    province: "",
    city: "",
    state: "",
  });

  const { apiUrl } = useConfig();
  useEffect(() => {
    // Verifica se todos os campos obrigatórios estão preenchidos
    const requiredFields = [
      "name",
      "cpfCnpj",
      "email",
      "mobilePhone",
      "postalCode",
      "address",
      "addressNumber",
      "province",
      "city",
      "state",
    ];
    const isComplete = requiredFields.every((field) => formData[field].trim() !== "");
    setFormComplete(isComplete);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const numericValue = value.replace(/\D/g, "");

    // Atualizar o estado com o valor numérico
    setFormData({ ...formData, [name]: numericValue });
    const formDataWithoutSymbols = {
      ...formData,
      cpfCnpj: formData.cpfCnpj.replace(/\D/g, ""),
      mobilePhone: formData.mobilePhone.replace(/\D/g, ""),
    };
    // Aplicar máscara para o CPF
    if (name === "cpfCnpj") {
      const maskedValue = value
        .replace(/\D/g, "") // Remove caracteres não numéricos
        .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto entre o terceiro e o quarto dígitos
        .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto entre o sexto e o sétimo dígitos
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca hífen entre o nono e o décimo primeiro dígitos

      setFormData({ ...formData, [name]: maskedValue });
    }
    // Aplicar máscara para o número de telefone
    else if (name === "mobilePhone") {
      const maskedValue = value
        .replace(/\D/g, "") // Remove caracteres não numéricos
        .replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses em volta dos dois primeiros dígitos
        .replace(/(\d{4,5})(\d{4})/, "$1-$2"); // Coloca hífen entre o quarto ou quinto e o nono dígitos

      setFormData({ ...formData, [name]: maskedValue });
    }
    // Outros campos
    else {
      setFormData({ ...formData, [name]: value });
    }
    // Verifica se todos os campos obrigatórios estão preenchidos
    const requiredFields = [
      "name",
      "cpfCnpj",
      "email",
      "mobilePhone",
      "postalCode",
      "address",
      "addressNumber",
      "province",
      "city",
      "state",
    ];
    const isComplete = requiredFields.every((field) => formData[field]);
    setFormComplete(isComplete);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Remover todos os caracteres não numéricos do CPF e do número de telefone

    // Verifica se todos os campos obrigatórios estão preenchidos
    const requiredFields = [
      "name",
      "cpfCnpj",
      "email",
      "mobilePhone",
      "postalCode",
      "address",
      "addressNumber",
      "province",
      "city",
      "state",
    ];
    const isComplete = requiredFields.every((field) => formData[field]);

    if (!isComplete) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    toast.success("Usuario cadastrado com sucesso.");

    try {
      const response = await axios.post(
         `${apiUrl}/api/signup`,
        formData
      );
      console.log("Dados enviados com sucesso:", response.data);
      if (response.data) {
        router.push("/"); // Substitua navigate("/") por router.push("/")
      }

      // Você pode redirecionar o usuário ou realizar outras ações após o envio bem-sucedido
    } catch (error) {
      console.error("Erro ao enviar informações do usuário:", error);
      // Trate erros aqui, como exibir uma mensagem para o usuário
    }
  };

  const handleCepChange = async (event) => {
    const newCep = event.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    setFormData({ ...formData, postalCode: newCep });

    if (newCep.length === 8) {
      try {
        const response = await axios.get(
          `https://viacep.com.br/ws/${newCep}/json/`,
          {}
        );
        const data = response.data;
        if (data.erro) {
          setIsCepInvalid(true)
          setShowCEP(false)
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            address: data.logradouro,
            complement: data.complemento,
            province: data.bairro,
            city: data.localidade,
            state: data.uf,
          }));
          setShowCEP(true);
          setIsCepInvalid(false)

        }


      } catch (error) {
        setIsCepInvalid(true)
        setShowCEP(false)
        console.error("Erro ao buscar endereço:", error);
        // Trate erros aqui, como exibir uma mensagem para o usuário
      }
    }
  };

  const formatCep = (cep) => {
    // Remove todos os caracteres não numéricos
    const numericCep = cep.replace(/\D/g, "");

    // Aplica a máscara
    if (numericCep.length > 5) {
      return `${numericCep.slice(0, 5)}-${numericCep.slice(5, 8)}`;
    } else {
      return numericCep;
    }
  };

  const inputStyle = {
    border: Object.values(formData).some((val) => val !== "")
      ? "1px solid #ccc"
      : "1px solid red",
  };
  return (
    <>
      <Header />
      <Navbar />
      {/* <Helmet>
        <title>Formulário de cadastro - Loja Mediewal</title>
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
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", marginTop: "15rem" }}
        className={styles.formContainer}
      >
        <h1 className={styles.dados}>DADOS PESSOAIS</h1>

        <div className={styles.childContainerA}>


          <div className={styles.child}>
            <label className={styles.label}>
              Nome Completo:

            </label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              value={formData.name}
              style={inputStyle}
              className={styles.input}
              placeholder="digite o nome completo..."
            />
          </div>

          <div className={styles.child}>
            <label className={styles.label}>
              CPF:

            </label>
            <input
              type="text"
              name="cpfCnpj"
              onChange={handleChange}
              value={formData.cpfCnpj}
              style={inputStyle}
              className={styles.input}
              placeholder="999.999.999-99"
            />
          </div>

          <div className={styles.child}>
            <label className={styles.label}>
              Email:

            </label >
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              style={inputStyle}
              className={styles.input}
              placeholder="digite o email..."
            />
          </div>




          <div className={styles.child}>

            <label className={styles.label}>
              Telefone:

            </label>
            <input
              type="text"
              name="mobilePhone"
              onChange={handleChange}
              value={formData.mobilePhone}
              style={inputStyle}
              className={styles.input}
              placeholder="88 88888-8888"

            />
          </div>





        </div>


        <h1 className={styles.endereco}>ENDEREÇO</h1>


        <div className={styles.childContainerB}>


          <div className={styles.child}>

            <label className={styles.label}>
              CEP:

            </label>
            <input
              type="text"
              name="postalCode"
              onChange={handleCepChange}
              value={formatCep(formData.postalCode)}
              placeholder="77777-777"
              style={inputStyle}
              className={styles.input}

            />
            {IsCepInvalid && (
              <>
                <span className={styles.errorCEP}>Cep invalido tente novamente.</span></>

            )}
          </div>











          {showCEP && (
            <>

              <div className={styles.child}>
                <label className={styles.label}>
                  Address:

                </label>

                <input
                  type="text"
                  name="address"
                  onChange={handleChange}
                  value={formData.address}
                  style={inputStyle}
                  className={styles.input}

                />
              </div>

              <div className={styles.child}>
                <label className={styles.label}>
                  Número do endereço:

                </label>


                <input
                  type="text"
                  name="addressNumber"
                  onChange={handleChange}
                  value={formData.addressNumber}
                  style={inputStyle}
                  className={styles.input}

                />
              </div>







              <div className={styles.child}>
                <label className={styles.label}>
                  Complemento:

                </label>
                <input
                  type="text"
                  name="complement"
                  onChange={handleChange}
                  value={formData.complement}
                  className={styles.input}

                />

              </div>



              <div className={styles.child}>

                <label className={styles.label}>
                  Bairro:

                </label>
                <input
                  type="text"
                  name="province"
                  onChange={handleChange}
                  value={formData.province}
                  style={inputStyle}
                  className={styles.input}

                />

              </div>



              <div className={styles.child}>

                <label className={styles.label}>
                  Cidade:

                </label>
                <input
                  type="text"
                  name="city"
                  onChange={handleChange}
                  value={formData.city}
                  style={inputStyle}
                  className={styles.input}

                />


              </div>






              <div className={styles.child}>
                <label className={styles.label}>
                  Estado:

                </label>
                <input
                  type="text"
                  name="state"
                  onChange={handleChange}
                  value={formData.state}
                  style={inputStyle}
                  className={styles.input}

                />

              </div>

            </>
          )}
        </div>


        <button type="submit" disabled={!formComplete} style={{ backgroundColor: formComplete ? "#05070A" : "#ccc" }} className={styles.ButtonDataCustomer}>
          Salvar
        </button>
      </form>
    </>
  );
};

export default SignUpForm;
