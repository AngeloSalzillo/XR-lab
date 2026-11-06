import NavigationBar from './components/NavigationBar.jsx';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Gallery from './sections/Gallery.jsx';
import Tools from './sections/Tools.jsx';
import Discover from './sections/Discover.jsx';
import Footer from './sections/Footer.jsx';
import './components/NavigationBar.css';
import ScrollToTop from './components/ScrollToTop.jsx';

import videoBackground_H264 from '../assets/about_background_H264.mp4';
import videoBackground_H265 from '../assets/about_background_H265.mp4';

import { Routes, Route } from 'react-router-dom';

export default function App() {

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

                  <video autoPlay muted loop playsInline>
                    <source src={videoBackground_H265} type='video/mp4; codecs="hvc1"'/>
                    <source src={videoBackground_H264} type='video/mp4'/>
                  </video>

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