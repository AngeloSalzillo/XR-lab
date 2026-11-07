import './Hero.css';
import Marquee from '../components/Marquee.jsx';
import BackgroundVideo from '../components/BackgroundVideo.jsx';
import videoBackground_H264 from '../../assets/hero_background_H264.mp4';
import videoBackground_H265 from '../../assets/hero_background_H265.mp4';

export default function Hero(){

    const marqueeText = " Interactive Graphics • Virtual Reality • Game Development • ";

    return (

        <header id="home">

            <div id="home-background">
                <BackgroundVideo
                    sources={[
                        { src: videoBackground_H265, type: 'video/mp4; codecs="hvc1"' },
                        { src: videoBackground_H264, type: 'video/mp4' }
                    ]}
                />
            </div>

            <div id="home-overlay"></div>

            <div id="home-content">
                <h1 className="bytesized-regular">XR LAB</h1>
                <h3 className="smooch-sans-thin">Software & XR Engineer</h3>
                <Marquee text={marqueeText}/>
            </div>

        </header>
    )
}