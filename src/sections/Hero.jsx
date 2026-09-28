import './Hero.css';
import Marquee from '../components/Marquee.jsx';
import ScrollDownAnimation from '../components/ScrollDownAnimation.jsx';
import videoBackground from '../../assets/hero_background.mp4';

export default function Hero(){

    const marqueeText = " Interactive Graphics • Virtual Reality • Game Development • ";

    return (

        <header id="home">

            <video autoPlay muted loop playsInline id="home-background">
                <source src={videoBackground} type="video/mp4"/>
            </video>

            <div id="home-overlay"></div>

            <div id="home-content">
                <h1 className="bytesized-regular">XR LAB</h1>
                <h3 className="smooch-sans-thin">Software & XR Engineer</h3>
                <Marquee text={marqueeText}/>
            </div>

        </header>
    )
}