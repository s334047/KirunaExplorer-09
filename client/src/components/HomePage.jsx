import React, {useState, useEffect} from "react";
import Kiruna_homepage1 from "./../assets/Kiruna_homepage1.jpg";
import Kiruna_homepage2 from "./../assets/Kiruna_homepage2.jpg";
import Kiruna_homepage3 from "./../assets/Kiruna_homepage3.jpg";

const Slideshow = () => {
    const images = [Kiruna_homepage1, Kiruna_homepage2, Kiruna_homepage3]; // Array con i percorsi delle immagini
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Stato iniziale
    const [slideDirection, setSlideDirection] = useState(true);
  
    // Cambia immagine ogni 2 secondi
    useEffect(() => {
      const interval = setInterval(() => {
        setSlideDirection(false);
        setTimeout(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length); // Incrementa l'indice e torna a 0
            setSlideDirection(true);
        }, 800)
      }, 10000); // Intervallo di 2 secondi
  
      return () => clearInterval(interval); // Pulisce l'intervallo alla fine
    }, []);
  
    const containerStyle = {
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      };

    // Stile per l'immagine
    const imageStyle = {
        position: "absolute",
        width: "100%",
        height: "100vh",
        objectFit: "cover",
        transition: "transform 2s cubic-bezier(0.53, 0.53, 0.63, 0.65)", // Transizione più lenta e fluida
        transform: slideDirection ? "translateX(0)" : "translateX(100%)",
      };
  
    const overlayStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    };
    
    const heroContentStyle = {
        position: "relative",
        color: "white",
        textAlign: "center",
        zIndex: 1,
        display: "flex", // Usa flexbox
        flexDirection: "column", // Posiziona gli elementi verticalmente
        justifyContent: "center", // Centra verticalmente
        height: "100%", // Assicurati che l'altezza sia al 100% del contenitore
    };

    return (
        <div style={containerStyle}>
        {/* Immagine corrente */}
        <img
            src={images[currentImageIndex]}
            alt={`slide-${currentImageIndex}`}
            style={{
            ...imageStyle,
            transform: slideDirection ? "translateX(0)" : "translateX(-100%)",
            }}
        />
         <div style={overlayStyle}/>
            <div style={heroContentStyle}>
            <h1>Benvenut*</h1>
            <p>paragrafo prova</p>
            </div>
        {/* Immagine successiva */}
        <img
            src={images[(currentImageIndex + 1) % images.length]}
            alt={`slide-${(currentImageIndex + 1) % images.length}`}
            style={{
            ...imageStyle,
            transform: slideDirection ? "translateX(100%)" : "translateX(0)",
            }}
        />
        </div>
    );
  };
  
function HeroSection(){
    const heroStyle = {
        position: "relative",
        height: "100vh",
        width: "100%",
        backgroundImage: `url(${Kiruna_homepage1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }

    const overlayStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      };
    
    const heroContentStyle = {
    position: "relative",
    color: "white",
    textAlign: "center",
    zIndex: 1,
    };

    return (
        <div style={heroStyle}>
            <div style={overlayStyle}/>
            <div style={heroContentStyle}>
            <h1>Benvenut*</h1>
            <p>paragrafo prova</p>
            </div>
        </div>
    )
}

function HomePage(){
    return (
        <HeroSection />
    )   
}

export {HomePage, Slideshow};
