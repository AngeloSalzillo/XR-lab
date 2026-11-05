import './About.css';
import Slideshow from '../components/Slideshow.jsx';
import { useState, useRef, useEffect } from 'react';

export default function About() {

    const [isVisible, setIsVisible] = useState(false);
    const aboutRef = useRef(null);

    useEffect(() => {

        const observer = new IntersectionObserver(

            ([entry]) => {

                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },

            {
                threshold: 0.9
            }
        );

        observer.observe(aboutRef.current);

        return () => observer.disconnect();

    }, []);

    return (

        <section id="about" ref={aboutRef}>

            <div id="about-overlay"></div>

            <div id="about-content">

                <div
                    id="about-text"
                    className={`${isVisible ? "visible" : ""}`}
                >

                    <div>
                        <h1 className="bytesized-regular">
                            About
                        </h1>

                        <div className="line"></div>
                    </div>

                    <p className="smooch-sans-thin">

                        <span className="bytesized-regular">
                            XR LAB
                        </span>


                        <strong>{' '}is a collection of projects and creative
                        explorations, experimenting the intersection
                        of software engineering, immersive technologies
                        and digital art. Every project is driven by
                        curiosity and built around the idea that code
                        can be used as a creative tool. XR LAB is where
                        engineering meets creativity to transform ideas
                        into interactive experiences. </strong>
                    </p>

                </div>


                <Slideshow
                    className={`${isVisible ? "visible" : ""}`}
                >

                    <div className="slide">

                        <h2 className="bytesized-regular">
                            Audioreactive
                        </h2>

                        <p className="smooch-sans-thin">
                            <strong>
                                Transforming sound into visual experiences
                            </strong>
                            <br/>
                            <br/>

                            Real-time visual systems driven by rhythm,
                            frequency, and amplitude, turning audio into
                            dynamic movement, light, and form. Sound becomes
                            an interactive component of the visual experience.
                        </p>

                    </div>


                    <div className="slide">

                        <h2 className="bytesized-regular">
                            Point Clouds
                        </h2>

                        <p className="smooch-sans-thin">
                            <strong>
                                Capturing and visualizing the physical world
                            </strong>
                            <br />
                            <br />

                            3D scanning techniques used to transform
                            real-world objects and environments into
                            digital spaces. LiDAR, photogrammetry,
                            and spatial data become interactive
                            three-dimensional representations.
                        </p>

                    </div>


                    <div className="slide">

                        <h2 className="bytesized-regular">
                            Environments
                        </h2>

                        <p className="smooch-sans-thin">
                            <strong>
                                Building immersive digital worlds
                            </strong>
                            <br />
                            <br />

                            Interactive environments combining 3D assets,
                            lighting, materials, and spatial design.
                        </p>

                    </div>


                    <div className="slide">

                        <h2 className="bytesized-regular">
                            Animations
                        </h2>

                        <p className="smooch-sans-thin">
                            <strong>
                                Bringing digital experiences to life
                            </strong>
                            <br />
                            <br />

                            Movement, transformation, and procedural
                            systems used to create dynamic digital
                            experiences. Animation becomes a tool for
                            interaction, visual storytelling, and
                            experimentation.
                        </p>

                    </div>

                </Slideshow>

            </div>

        </section>
    );
}