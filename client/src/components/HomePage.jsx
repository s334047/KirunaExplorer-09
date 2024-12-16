import React, {useState, useEffect} from "react";
import Kiruna_homepage1 from "./../assets/Kiruna_homepage1.jpg";
import Kiruna_homepage2 from "./../assets/Kiruna_homepage2.jpg";
import Kiruna_homepage3 from "./../assets/Kiruna_homepage3.jpg";
  
export default function HomePage(props){
    return (
        <div>
            <HeroSection user={props.user}/>
        </div>
        
    )   
}

function HeroSection(props){
    const images = [Kiruna_homepage1, Kiruna_homepage2, Kiruna_homepage3];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHoveredLeft, setIsHoveredLeft] = useState(false);
    const [isHoveredRight, setIsHoveredRight] = useState(false);

    function nextImage(){
        setCurrentImageIndex((currentImageIndex) => (currentImageIndex + 1) % images.length);
    };

    function prevImage(){
        setCurrentImageIndex((currentImageIndex) => (currentImageIndex - 1 + images.length) % images.length);
    }

    const heroStyle = {
        position: "relative",
        height: "100vh",
        width: "100%",
        backgroundImage: `url(${images[currentImageIndex]})`,
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

    const arrowStyle = {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        color: "white",
        border: "none",
        padding: "10px 20px",
        cursor: "pointer",
        zIndex: 2,
        background: "none",
        textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)",
        fontSize: "24px",
        transition: "transform 0.3s ease", //per l'hovering
    };

    return (
        <div style={heroStyle}>
            <div style={overlayStyle}/> {/*sovrapposizione*/}
            <div style={heroContentStyle}> {/*scritte*/}
                <Message user={props.user}/>
            </div>
            
            {/* Freccia Sinistra */}
            <button
                onClick={prevImage}
                onMouseEnter={() => setIsHoveredLeft(true)}
                onMouseLeave={() => setIsHoveredLeft(false)}
                style={{ ...arrowStyle, left: "10px", 
                    transform: isHoveredLeft ? "translateY(-50%) scale(1.2)" : "translateY(-50%)" }} // Posizionata a sinistra
            >
                 <i class="bi bi-arrow-left-circle"></i> {/* Simbolo di freccia sinistra */}
            </button>

            {/* Freccia Destra */}
            <button
                onClick={nextImage}
                onMouseEnter={() => setIsHoveredRight(true)}
                onMouseLeave={() => setIsHoveredRight(false)}
                style={{ ...arrowStyle, right: "10px",
                    transform: isHoveredRight ? "translateY(-50%) scale(1.2)" : "translateY(-50%)"
                 }} // Posizionata a destra
            >
                <i class="bi bi-arrow-right-circle"></i> {/* Simbolo di freccia destra */}
            </button>
        </div>
    );
}

function Message(props){
    const username = props.user ? props.user.username : null;
    const message = username ? "Take part in Kiruna's transformation" : "Log-in to see more details";
    return(
        <div style={{fontSize: "24px"}}>
            {username ? <h1 style={{fontSize: "90px"}}>Welcome {props.user.username}!</h1> : <h1 style={{fontSize: "90px"}}>Welcome in Kiruna Explorer!</h1>}
            <p style={{fontSize: "30px"}}>{message}</p>
        </div>
    );
}

