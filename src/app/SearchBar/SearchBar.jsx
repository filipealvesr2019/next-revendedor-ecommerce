'use client'; // Adicione isso se este arquivo também precisar ser um Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchBar.module.css';
import RootLayout from '@/app/layout';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    console.log('Search Query:', searchQuery);
    router.push(`/search/product/${searchQuery}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (

    <div className={styles.inputWrapper}>
      <input
        type="text"
        placeholder="Digite o nome do produto"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        className={styles.inputContainer}
      />
      <img
        src='https://i.ibb.co/t4n36kx/loupe-5.png'
        onClick={handleSearch}
        className={styles.searchIcon}
        alt="Search"
      />
    </div>

   
  );
};

export default SearchBar;
