import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchIcon from "@mui/icons-material/Search";
import Cookies from 'js-cookie';
import  styles from "./FreteComponent.module.css"
import { useConfig } from '../context/ConfigContext';
const FreteComponent = () => {
  const [cep, setCep] = useState(localStorage.getItem('cep') || '');
  const [frete, setFrete] = useState(null);
  const userId = Cookies.get('userId'); // Obtenha o token do cookie

  const token = Cookies.get('token'); // Obtenha o token do cookie
  const { apiUrl } = useConfig();

  useEffect(() => {
    localStorage.setItem('cep', cep);
  }, [cep]);

  useEffect(() => {
    const fetchFrete = async () => {
      try {
     

        // Faz a solicitação GET para obter os dados atualizados do frete
        const responseGet = await axios.get(`${apiUrl}/api/frete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // Adicionando content-type

          },
        }
      );
        setFrete(responseGet.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchFrete();
  }, [cep, userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {

      // Faz a solicitação POST para obter os dados do frete com o novo CEP
      await axios.post(`${apiUrl}/api/frete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
       
        },
      }, { cep }
     );

      // Atualiza o estado do frete com os dados do frete da requisição GET
      const responseGet = await axios.get(`${apiUrl}/api/frete/${userId}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      
      },
   
    });

      console.log('log', responseGet)
      setFrete(responseGet.data);
      await axios.get(`${apiUrl}/api/cart/${userId}`,{ headers: {
        Authorization: `Bearer ${token}`,
      
      }});

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div >
      
      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center" }}    className={styles.formContainer}>
      
        <input
          type="text"
          value={cep}
          onChange={(event) => setCep(event.target.value)}
          placeholder="Digite o CEP"
            className={styles.inputCep}
        />
        <button type="submit"
        
        className={styles.buttonCep}

        ><SearchIcon />Salvar</button>
      </form>

      {frete && (
        <div>
          {frete.map((item, index) => (
            <div key={index}>
              {!frete ? "" : <>
              
                <b></b> <img src={item.logo && item.logo} alt="logo das transportadoras" style={{ width: "10vw" }} />

                <p>{item.nomeTransportadora}</p>
                <p>Data Prevista de Entrega: { item.dataPrevistaEntrega && item.dataPrevistaEntrega.split('T')[0].split('-').reverse().join('/')}({item.prazoEntrega && item.prazoEntrega} dias)</p>

                <p>Valor do Frete: R$  {item.valorFrete && item.valorFrete}</p>
             
              </>
}

            </div>
          ))}

          
        </div>
      )}
     
    </div>
  );
};

export default FreteComponent;