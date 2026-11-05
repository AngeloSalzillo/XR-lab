import './Acordion.css';
import plusIcon from '../../assets/plus_icon.svg';
import minusIcon from '../../assets/minus_icon.svg';
import { useState } from 'react';

export default function Acordion({title, children, onToggle}) {

    const [isExpanded, setIsExpanded] = useState(true);

    function handleClick() {

        const newState = !isExpanded;

        setIsExpanded(newState);

        if (onToggle) {
            onToggle(newState);
        }
    }

    return (

        <div className="acordion">

            <div className="acordion-header">

                <button className={`plus-button ${isExpanded ? "expanded" : ""}`} onClick={handleClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="white"
                    >
                        <path d="M454.04-454.54H228.08v-51.92h225.96v-225.96h51.92v225.96h225.96v51.92H505.96v225.96h-51.92v-225.96Z"/>
                    </svg>
                </button>

                <button className={`minus-button ${isExpanded ? "expanded" : ""}`} onClick={handleClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="white"
                    >
                        <path d="M228.08-454.54v-51.92h503.84v51.92H228.08Z"/>
                    </svg>
                </button>

                <h2 className="acordion-description bytesized-regular"> 
                    {title} 
                </h2>
            </div> 

            <div className={`acordion-content ${isExpanded ? "expanded" : ""}`}>
                {children}
            </div>
        </div>
    );
}