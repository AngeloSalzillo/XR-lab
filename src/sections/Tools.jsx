import blenderLogo from '../../assets/blender_logo.png';
import cSharpLogo from '../../assets/c-sharp-c-seeklogo.png';
import cPPLogo from '../../assets/cpp_logo.png'
import htmlLogo from '../../assets/HTML5_Logo_512.png';
import javaScriptLogo from '../../assets/javascript-seeklogo.png';
import reactLogo from '../../assets/react-logo.jpg';
import scaniverseLogo from '../../assets/scaniverse-logo.png';
import touchdesignerLogo from '../../assets/TouchDesigner_Square_Logo-White.png';
import unityLogo from '../../assets/U_Logo_Small_White_RGB_1C.png';
import './Tools.css';
import { useRef, useEffect } from 'react';

export default function Tools(){

    const sectionRef = useRef(null);

    // Remember the highest progress reached
    const maxProgress = useRef(0);

    const progTools = [ 
        cSharpLogo,
        cPPLogo,
        htmlLogo,
        javaScriptLogo,
        reactLogo,
    ]

    const devTools = [
        blenderLogo,
        unityLogo,
        scaniverseLogo,
        touchdesignerLogo
    ]

    useEffect(() => {

        const handleScroll = () => {

            const section = sectionRef.current;

            if (!section) return;

            const rect = section.getBoundingClientRect();

            // Don't start calculating until the section
            // actually reaches the viewport
            if (rect.top > window.innerHeight) {
                return;
            }

            const progress =
                1.5*(window.innerHeight - rect.top) / rect.height;

            const clampedProgress =
                Math.max(0, Math.min(1, progress));

            // Only increase the value
            if (clampedProgress > maxProgress.current) {

                maxProgress.current = clampedProgress;

                document.documentElement.style.setProperty(
                    '--translate',
                    maxProgress.current
                );
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

    }, []);

    return (

        <section id="tools-section" ref={sectionRef}>

            <div id="tool-text">
                <div id="tool-text-overlay"></div>

                <h1 className="bytesized-regular">
                    Technologies
                </h1>

                <p className="smooch-sans-thin">
                    From 3D environments to music-reactive visuals,
                    exploring the tools behind immersive digital experiences.
                </p>

            </div>

            <div className="scroll-container-left prog">

                <div className="logo-container">
                    {progTools.map((tool, index) => {
                        return <img key={index} src={tool}/>
                    })}
                </div>

                <div className="logo-container">
                    {progTools.map((tool, index) => {
                        return <img key={index} src={tool}/>
                    })}
                </div>

            </div>

            <div className="scroll-container-right dev">

                <div className="logo-container">
                    {devTools.map((tool, index) => {
                        return <img key={index} src={tool}/>
                    })}
                </div>

                <div className="logo-container">
                    {devTools.map((tool, index) => {
                        return <img key={index} src={tool}/>
                    })}
                </div>

            </div>

        </section>
    )
}