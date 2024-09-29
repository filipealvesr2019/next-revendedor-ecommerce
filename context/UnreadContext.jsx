"use client"; // Ensure this component runs on the client side

import React, { createContext, useState, useContext, useEffect } from 'react';

const UnreadContext = createContext();

export const useUnreadCount = () => useContext(UnreadContext);

export const UnreadProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(() => {
    // Check if localStorage is available
    if (typeof window !== 'undefined' && localStorage) {
      // Try to recover the value from localStorage; if it doesn't exist, return 0
      return parseInt(localStorage.getItem('unreadCount')) || 0;
    }
    return 0; // Return 0 if localStorage is not available
  });

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('unreadCount', unreadCount);
    }
  }, [unreadCount]);

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  return (
    <UnreadContext.Provider value={{ unreadCount, updateUnreadCount }}>
      {children}
    </UnreadContext.Provider>
  );
};
