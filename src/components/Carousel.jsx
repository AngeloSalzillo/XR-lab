import './Carousel.css';
import { useState, Children } from 'react';

export default function Carousel({ children }) {

    const [currentItem, setCurrentItem] = useState(0);
    const numChildren = Children.count(children);

    function handleRightClick() {

        
        if(currentItem === numChildren - 1)
            setCurrentItem(0);
        else
            setCurrentItem(currentItem + 1);
    }

    function handleLeftClick() {

        if(currentItem === 0)
            setCurrentItem(numChildren - 1);
        else
            setCurrentItem(currentItem - 1);
    }

    console.log(currentItem);

    return (

        <div className="carousel">
            <div className="items-container">
                <button className="left-arrow-button" onClick={handleLeftClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" fill="currentColor">
                        <path d="m317.5-118.17-31-30.33 333-332.17L286.5-813l31-30.17L680-480.67l-362.5 362.5Z"/>
                    </svg>
                </button>

                {Children.toArray(children)[currentItem]}

                <button className="right-arrow-button" onClick={handleRightClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" fill="currentColor">
                        <path d="m317.5-118.17-31-30.33 333-332.17L286.5-813l31-30.17L680-480.67l-362.5 362.5Z"/>
                    </svg>
                </button>
            </div>

            <div className="index-point-container">

                {Children.toArray(children).map((child, index) => (
                    <div
                        key={index}
                        className="index-point"
                    ></div>
                ))}

                <div
                    className="active-index-point"
                    style={{
                        transform: `translateX(${currentItem * 15}px)`
                    }}
                ></div>

            </div>
        </div>
    )
}