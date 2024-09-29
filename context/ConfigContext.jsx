"use client"; // Adicione isso no topo do arquivo
import React, { createContext, useContext, useState } from 'react';


export const ConfigContext = createContext();
const localhost = 'http://localhost:3001';
const prodURL = 'https://revendedor-api.onrender.com';

export const ConfigProvider = ({ children }) => {
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || localhost);

  return (
    <ConfigContext.Provider value={{ apiUrl, setApiUrl }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
