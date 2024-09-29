import React from 'react';
import styles from "./QRCode.module.css"
class QRCODE extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: null
    };
  }

  componentDidMount() {
    // Decodifica a string base64 para obter os dados binários da imagem
    const imageData = atob(this.props.encodedImage);

    // Converte os dados binários para um array de bytes
    const bytes = new Uint8Array(imageData.length);
    for (let i = 0; i < imageData.length; i++) {
      bytes[i] = imageData.charCodeAt(i);
    }

    // Cria um Blob a partir do array de bytes
    const blob = new Blob([bytes], { type: 'image/png' });

    // Cria um URL de objeto a partir do Blob
    const imageUrl = URL.createObjectURL(blob);

    // Atualiza o estado com o URL da imagem
    this.setState({ imageUrl: imageUrl });
  }

  componentWillUnmount() {
    // Revoga o URL do objeto para liberar memória quando o componente for desmontado
    URL.revokeObjectURL(this.state.imageUrl);
  }

  render() {
    const { imageUrl } = this.state;
    return (
      <div>
        {imageUrl &&
          <img src={imageUrl} alt="Imagem Decodificada" className={styles.imageUrl}/>
        }
      </div>
    );
  }
}

export default QRCODE;
