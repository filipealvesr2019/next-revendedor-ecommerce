// Navbar.js
"use client"
import React, { useEffect, useState } from "react";
import "./Navbar.css";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Link from "next/link";
const Navbar = () => {
  const [activeLink, setActiveLink] = useState(null);

  const handleItemClick = (index) => {
    setActiveLink(index);
  };

  const isActive = (index) => {
    return index === activeLink ? "active" : "";
  };

  return (
    <div className="hide">
      <div className="navbar">
        <Link href={"/"} className={`nav-item ${isActive(0)} `}>
          <img src="https://i.ibb.co/J3gLZnz/home-4.png"  alt="icone de home(inicio)"/>
          <span className="span">Home</span>
        </Link>

        <Link href={"/categoriasMobile"} className={`nav-item ${isActive(1)}`}>
          <img src="https://i.ibb.co/HqPdMws/category-1.png"  alt="icone de categorias"/>
          <span className="span">Categorias</span>
        </Link>

        <Link href={"/cart"} className={`nav-item ${isActive(2)}`}>
          <img src="https://i.ibb.co/RPwPY6t/shopping-bag-2.png" alt="icone do carrinho de compras"/>
          <span className="span">Carrinho</span>
        </Link>

        <Link href={"/conta"} className={`nav-item ${isActive(3)}`}>
          <AccountCircleOutlinedIcon  style={{color:"black", fontSize:"32px"}}/>
          <span className="span">Perfil</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
