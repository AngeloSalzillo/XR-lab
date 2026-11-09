
import './Hero.css';
import { useEffect, useState } from 'react';

import Marquee from '../components/Marquee.jsx';
import BackgroundVideo from '../components/BackgroundVideo.jsx';

import videoBackground_H264 from '../../assets/H264_hero_background.mp4';
import videoBackground_H265 from '../../assets/H265_hero_background.mp4';

import videoBackground_mobile_H265 from '../../assets/H265_hero_shorter_background.mp4';
import videoBackground_mobile_H264 from '../../assets/H264_hero_shorter_background.mp4';

import posterBackground from '../../assets/hero_poster.jpg';


export default function Hero() {

    const marqueeText = " Interactive Graphics • Virtual Reality • Game Development • ";

    // --------------------------------------------------------
    // MOBILE DETECTION
    // --------------------------------------------------------

    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia('(max-width: 768px)').matches
    );

    useEffect(() => {

        const mediaQuery = window.matchMedia('(max-width: 768px)');

        const handleChange = (event) => setIsMobile(event.matches);

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);

    }, []);


    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    return (

        <header id="home">

            <div id="home-background">

                <BackgroundVideo
                    key={isMobile ? 'mobile' : 'desktop'}
                    sources={
                        isMobile
                            ? [
                                { src: videoBackground_mobile_H265, type: 'video/mp4; codecs="hvc1"' },
                                { src: videoBackground_mobile_H264, type: 'video/mp4' }
                            ]
                            : [
                                { src: videoBackground_H265, type: 'video/mp4; codecs="hvc1"' },
                                { src: videoBackground_H264, type: 'video/mp4' }
                            ]
                    }
                    poster={posterBackground}
                />

            </div>

            <div id="home-overlay"></div>

            <div id="home-content">

                <h1 className="bytesized-regular">XR LAB</h1>

                <h3 className="smooch-sans-thin">Software & XR Engineer</h3>

                <Marquee text={marqueeText}/>

            </div>

        </header>
    );
}
