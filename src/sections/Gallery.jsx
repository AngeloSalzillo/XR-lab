import './Gallery.css';
import videoBackground_desktop_H264 from '../../assets/gallery_background_H264.mp4'
import videoBackground_desktop_H265 from '../../assets/gallery_background_H265.mp4'
import videoBackground_mobile_H264 from '../../assets/gallery_background_mobile_H264.mp4'
import videoBackground_mobile_H265 from '../../assets/gallery_background_mobile_H265.mp4'
import BackgroundVideo from '../components/BackgroundVideo.jsx';
import Carousel2 from '../components/Carousel2.jsx';
import ScrollRevealText from '../components/ScrollRevealText.jsx';
import ThreeDCarousel from '../components/ThreeDCarousel.jsx';
import Footer from './Footer.jsx';
import { useEffect, useRef, useState } from 'react';

export default function Gallery() {

    const galleryRef = useRef(null);
    const titleRef = useRef(null);
    const pointcloudsRef = useRef(null);
    const animationsRef = useRef(null);  

    // Temporary height used only when an accordion is closed
    // while the user is scrolled below the Gallery's natural height.
    const [temporaryHeight, setTemporaryHeight] = useState(null);

    // The scroll position at which the accordion was closed.
    const closeScrollY = useRef(null);


    function handleAccordionToggle(isOpen) {

        // We only need to do something when an accordion CLOSES.
        if (isOpen) {
            return;
        }

        const gallery = galleryRef.current;

        if (!gallery) {
            return;
        }

        /*
         * Get the current scroll position BEFORE the Gallery
         * becomes shorter.
         */
        const currentScrollY = window.scrollY;

        /*
         * Find the Gallery's position in the document.
         */
        const galleryTop =
            gallery.getBoundingClientRect().top + window.scrollY;

        /*
         * We need the Gallery to remain tall enough that the
         * current viewport is still inside it.
         */
        const requiredHeight =
            currentScrollY +
            window.innerHeight -
            galleryTop;

        closeScrollY.current = currentScrollY;

        setTemporaryHeight(requiredHeight);
    }


    useEffect(() => {

        function handleScroll() {

            if (temporaryHeight === null) {
                return;
            }

            /*
             * Once the user scrolls back above the position where
             * the accordion was closed, the temporary height is
             * no longer necessary.
             */
            if (
                closeScrollY.current !== null &&
                window.scrollY < closeScrollY.current
            ) {
                setTemporaryHeight(null);
                closeScrollY.current = null;
            }
        }

        window.addEventListener('scroll', handleScroll, {
            passive: true
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

    }, [temporaryHeight]);

    useEffect(() => {
        let frame = null;

        const update = () => {
            frame = null;

            const title = titleRef.current;
            const pointclouds = pointcloudsRef.current;
            if (!title || !pointclouds) return;

            // The title is completely covered once the point clouds' top edge
            // has reached the title's top edge. From then on it stays hidden.
            const covered =
                pointclouds.getBoundingClientRect().top <=
                title.getBoundingClientRect().top;

            title.style.visibility = covered ? 'hidden' : 'visible';
        };

        const onScroll = () => {
            if (frame === null) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (frame !== null) cancelAnimationFrame(frame);
        };
    }, []);

    useEffect(() => {
        const el = animationsRef.current;
        if (!el) return;

        // Sticky `top` = viewport height - element height.
        // If the element is taller than the viewport this is negative, so it
        // freezes when its BOTTOM edge reaches the bottom of the screen.
        const updateStickyTop = () => {
            el.style.top = `${window.innerHeight - el.offsetHeight}px`;
        };

        updateStickyTop();

        const observer = new ResizeObserver(updateStickyTop);
        observer.observe(el);
        window.addEventListener('resize', updateStickyTop);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateStickyTop);
        };
    }, []);


    return (

        <section
            id="gallery"
            ref={galleryRef}
            style={
                temporaryHeight !== null
                    ? { minHeight: `${temporaryHeight}px` }
                    : undefined
            }
        >

            <div id="gallery-background">
                <BackgroundVideo className="mobile-background"
                    sources={[
                        { src: videoBackground_mobile_H265, type: 'video/mp4; codecs="hvc1"' },
                        { src: videoBackground_mobile_H264, type: 'video/mp4' }
                    ]}
                />
                <BackgroundVideo className="desktop-background"
                    sources={[
                        { src: videoBackground_desktop_H265, type: 'video/mp4; codecs="hvc1"' },
                        { src: videoBackground_desktop_H264, type: 'video/mp4' }
                    ]}
                />
            </div>

            <div id="gallery-text" ref={titleRef}>
                <h1 className = "bytesized-regular">Gallery</h1>
            </div>


            <div id="gallery-container">

                <div id="gallery-pointclouds-container" ref={pointcloudsRef}>
                    <div id="gallery-pointclouds-text" className="bytesized-regular">
                        <h1>Point Clouds</h1>
                    </div>
                    <ScrollRevealText
                        lines={[
                            'What was once solid',
                            'becomes a field of fragments,',
                            'and is forever preserved',
                            'as digital memory'
                        ]}
                    />
                    <Carousel2/>
                </div>
                <div id="gallery-pointclouds-bottom-overlay"></div>
                
                <div id="gallery-animations-container" ref={animationsRef}>

                    <div id="gallery-animations-text" className="bytesized-regular">
                        <h1>Animations</h1>
                    </div>

                    {/*
                    <DepthRevealText
                        lines={[
                            'But memory is never still',
                            'What is preserved can transform',
                            'Time becomes a medium',
                            'And motion, a new reality'
                        ]}
                    />
                    */}

                    <ThreeDCarousel id="desktop-carousel">
                        <iframe
                            src="https://www.youtube.com/embed/Zj6z9X_MWAk?modestbranding=1&rel=0"
                            title="Animation video 1"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        />

                        <iframe
                            src="https://www.youtube.com/embed/LDGk5J2uM3E?modestbranding=1&rel=0"
                            title="Animation video 2"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        />

                        <iframe
                            src="https://www.youtube.com/embed/Zj6z9X_MWAk?modestbranding=1&rel=0"
                            title="Animation video 1"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        />

                        <iframe
                            src="https://www.youtube.com/embed/LDGk5J2uM3E?modestbranding=1&rel=0"
                            title="Animation video 2"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        />

                        <iframe
                            src="https://www.youtube.com/embed/Zj6z9X_MWAk?modestbranding=1&rel=0"
                            title="Animation video 1"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        />

                        <iframe
                            src="https://www.youtube.com/embed/LDGk5J2uM3E?modestbranding=1&rel=0"
                            title="Animation video 2"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        />

                        <iframe
                            src="https://www.youtube.com/embed/Zj6z9X_MWAk?modestbranding=1&rel=0"
                            title="Animation video 1"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        />

                        <iframe
                            src="https://www.youtube.com/embed/LDGk5J2uM3E?modestbranding=1&rel=0"
                            title="Animation video 2"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        />
                    </ThreeDCarousel>

                    <ThreeDCarousel id="mobile-carousel">
                        <iframe 
                            width="412" 
                            height="732" 
                            src="https://www.youtube.com/embed/kCQ4wjICZmM" 
                            title="Where’s the bathroom? - Animation clip in Unity #3d #unity #animation #digitalart #techno" 
                            frameBorder="0" 
                            allow="accelerometer; autoPlay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        ></iframe>

                        <iframe 
                            width="412" 
                            height="732" 
                            src="https://www.youtube.com/embed/nQXsbUHabFQ"
                            title="Noise Bloom - Audioreactive Visuals with Touchdesginer #3d #touchdesigner #digitalart #techno #beat" 
                            frameBorder="0" 
                            allow="accelerometer; autoPlay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        ></iframe>

                        <iframe 
                            width="412" 
                            height="732" 
                            src="https://www.youtube.com/embed/GmKZDNe-AUg"
                            title="Digital Memory - Audioreactive Visuals with Touchdesigner  #3d  #touchdesigner #visual #digitalart"
                            frameBorder="0" 
                            allow="accelerometer; autoPlay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        ></iframe>

                        <iframe 
                            width="412" 
                            height="732" 
                            src="https://www.youtube.com/embed/kCQ4wjICZmM" 
                            title="Where’s the bathroom? - Animation clip in Unity #3d #unity #animation #digitalart #techno" 
                            frameBorder="0" 
                            allow="accelerometer; autoPlay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        ></iframe>

                        <iframe 
                            width="412" 
                            height="732" 
                            src="https://www.youtube.com/embed/nQXsbUHabFQ"
                            title="Noise Bloom - Audioreactive Visuals with Touchdesginer #3d #touchdesigner #digitalart #techno #beat" 
                            frameBorder="0" 
                            allow="accelerometer; autoPlay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        ></iframe>

                        <iframe 
                            width="412" 
                            height="732" 
                            src="https://www.youtube.com/embed/GmKZDNe-AUg"
                            title="Digital Memory - Audioreactive Visuals with Touchdesigner  #3d  #touchdesigner #visual #digitalart"
                            frameBorder="0" 
                            allow="accelerometer; autoPlay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                borderRadius: '10px'
                            }}
                        ></iframe>

                    </ThreeDCarousel>
                </div>

                <div id="gallery-environments-container">
                    <div id="gallery-environments-text" className="bytesized-regular">
                        <h1>Environments</h1>
                    </div>

                    <div id="environments-iframe-container" className="desktop-only">
                        <iframe 
                            width="1053" 
                            height="592" 
                            src="https://www.youtube.com/embed/EFEiAuZ2IkU" 
                            title="Environments1" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div id="environments-iframe-container" className="mobile-only">
                        <iframe 
                            width="412" 
                            height="732" 
                            src="https://www.youtube.com/embed/elm-OhkaQXU"
                            title="Environments1 vertical" 
                            frameBorder="0" 
                            allow="accelerometer; autoPlay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </div>

            <Footer />


        </section>
    );
}