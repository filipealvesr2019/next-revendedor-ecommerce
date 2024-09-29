import "./Footer.css";
// import InstagramIcon from "@mui/icons-material/Instagram";
// import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";

export default function Footer() {
  return (
    <footer className="footerContainer">
      <div className="footerContent">
        <div className="footerSection">
          <h3 className="footerH3">Sobre Nós</h3>
          <p className="footer__p">
            Somos a Mediewal, uma marca de roupas masculinas criada para quem
            quer se vestir bem e reinar no estilo. Inspirada no conceito de
            elegância  e confiança.
          </p>
        </div>
        <div className="footerSection">
          <h3 className="footerH3">Contato</h3>
          <p className="footer__p">Email: suporte@mediewal.com.br</p>
          {/* <p className="footer__p">Telefone: (00) 1234-5678</p> */}
          <p className="footer__p">CNPJ: 56.171.368/0001-77</p>
        </div>
        <div className="footerSection">
          <h3 className="footerH3">Saiba mais nas nossas redes</h3>
          <div className="footer__social">
            <a href="https://www.facebook.com/profile.php?id=100078800343826&locale=pt_BR" aria-label="facebook">
              {/* <FacebookOutlinedIcon style={{ width: "35px", height: "35px" }} /> */}
            </a>
            <a href="https://www.instagram.com/lojamediewal/"  aria-label="instagram">
              {/* <InstagramIcon style={{ width: "35px", height: "35px" }} /> */}
            </a>
          </div>
        </div>
      </div>
      <p className="footer__Copyright">Copyright © 2024 - 2024</p>
    </footer>
  );
}
