// providers.js (Client Component)
"use client";

import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ConfigProvider } from "../context/ConfigContext";
import { UnreadProvider } from "../context/UnreadContext";


export default function Providers({ children }) {
  return (
    <CartProvider>
      <ConfigProvider>
        <AuthProvider>
          <UnreadProvider>
            {children}
          </UnreadProvider>
        </AuthProvider>
      </ConfigProvider>
    </CartProvider>
  );
}
