import './Slideshow.css';
import { useState , useEffect, Children } from 'react';
import { Link } from 'react-router-dom';

export default function({children, ...props}) {

    const [currentSlide, setCurrentSlide] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const numChildren = Children.count(children);
    const transitionDuration = 500;
    const slideDuration = 4000;


    //Automatic sliding
    useEffect(() => {

        const timer = setInterval(() => {

        if (currentSlide === numChildren - 1) {

            // Move to the cloned first slide
            setCurrentSlide(numChildren);

            // Wait for the CSS transition to finish
            setTimeout(() => {

                // Disable transition
                setTransitionEnabled(false);

                // Jump to the real first slide
                setCurrentSlide(0);

                // Re-enable transition on the next frame
                requestAnimationFrame(() => {
                    setTransitionEnabled(true);
                });

            }, transitionDuration);

        } else {

            setCurrentSlide(currentSlide + 1);
        }

    }, slideDuration);

    return () => clearInterval(timer);

    }, [currentSlide]);


    return(

        <div className={`slideshow-container ${props.className}`}>
            <div className="slideshow" 
            style={{transform: `translateX(${-currentSlide*100}%)`,
                    transition: transitionEnabled ? 'transform 0.5s ease' : 'none'}}>
                {children}
                {Children.toArray(children)[0]}
            </div>

            <Link to="/gallery" id="explore-button">
                <p className="bytesized-regular">
                    Explore ›
                </p>
            </Link> 
        </div>
    )
}