import NavigationBar from './components/NavigationBar.jsx';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Gallery from './sections/Gallery.jsx';
import Tools from './sections/Tools.jsx';
import Discover from './sections/Discover.jsx';
import Footer from './sections/Footer.jsx';
import './components/NavigationBar.css';
import ScrollToTop from './components/ScrollToTop.jsx';

import videoBackground from '../assets/about_background.mp4';

import { Routes, Route } from 'react-router-dom';

export default function App() {

  return (

    <>
      <NavigationBar type="navbar"/>

      <Routes>

        <Route
          path="/"
          element={
            <>
              <Hero />

              <div id="about-scroll-area">

                <div id="sticky-background">

                  <video autoPlay muted loop playsInline>
                    <source
                      src={videoBackground}
                      type="video/mp4"
                    />
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