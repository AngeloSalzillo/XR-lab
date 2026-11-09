import './components/NavigationBar.css';
import NavigationBar from './components/NavigationBar.jsx';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Gallery from './sections/Gallery.jsx';
import Tools from './sections/Tools.jsx';
import Discover from './sections/Discover.jsx';
import Footer from './sections/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import BackgroundVideo from './components/BackgroundVideo.jsx';
import videoBackground_H264 from '../assets/H264_about_background.mp4';
import videoBackground_H265 from '../assets/H265_about_background.mp4';
import videoBackground_mobile_H264 from '../assets/H264_about_mobile_background.mp4';
import videoBackground_mobile_H265 from '../assets/H265_about_mobile_background.mp4';
import posterBackground from '../assets/about_poster.jpg';
import posterBackground_mobile from '../assets/about_mobile_poster.jpg';

import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

export default function App() {

  // Only the background video (and poster) that matches the screen is
  // rendered, so the other file is never requested or played, and the
  // wrong poster can never show. (Hiding a <video> with display: none
  // does NOT stop it from downloading.)
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 768px)').matches
  );

  useEffect(() => {

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleChange = (event) => setIsMobile(event.matches);

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);

  }, []);

  return (

    <>
      <NavigationBar type="navbar"/>

      {/* Resets the scroll position to the top on every route change.
          It must be rendered before <Routes> so it runs before the
          pages (and ScrollRevealText) mount their effects. */}
      <ScrollToTop />

      <Routes>

        <Route
          path="/"
          element={
            <>
              <Hero />

              <div id="about-scroll-area">

                <div id="sticky-background">

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
                    poster={isMobile ? posterBackground_mobile : posterBackground}
                  />

                </div>

                <About />
                <Tools />
                <Discover />
                <Footer />

              </div>
            </>
          }
        />

        <Route
          path="/gallery"
          element={<Gallery />}
        />

      </Routes>
    </>
  );
}