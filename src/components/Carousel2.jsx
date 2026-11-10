import './Carousel2.css';
import old_apartment_entrance from '../../assets/old_apartment_entrance.jpeg';
import montjuic_dungeon from '../../assets/montjuic_dungeon.jpeg';
import montjuic_portal from '../../assets/montjuic_portal.jpeg';
import eduardo from '../../assets/eduardo.jpeg';
import { useState, useRef, useEffect } from 'react';


// ============================================================
// CAROUSEL ITEMS
// ============================================================
// The list is rendered twice in a row so the movement can loop
// infinitely (the second copy takes over when the first one has
// scrolled out).

const ITEMS = [
    {
        image: old_apartment_entrance,
        alt: 'Old apartment entrance',
        model: 'https://sketchfab.com/models/fe267a9e34b14063a050fcab4d378026/embed?autostart=1&ui_hint=2'
    },
    {
        image: montjuic_dungeon,
        alt: 'Montjuic dungeon',
        model: 'https://sketchfab.com/models/29c05b49bfc5483ca06eebca930e5a54/embed?autostart=1&ui_hint=2'
    },
    {
        image: montjuic_portal,
        alt: 'Montjuic portal',
        model: 'https://sketchfab.com/models/62163d2c6da34c45b44f94cffa4cd626/embed?autostart=1&ui_hint=2'
    },
    {
        image: eduardo,
        alt: 'Eduardo',
        model: 'https://sketchfab.com/models/b61af2d26e7b4852a06a911274644756/embed?autostart=1&ui_hint=2'
    },
];

const PLAY_ICON_PATH =
    'm372.67-289.33 298-190.67-298-190.67v381.34ZM479.69-58.67q-86.66 0-163.5-33.35t-133.83-90.34q-56.99-56.99-90.34-133.91Q58.67-393.2 58.67-480q0-87.48 33.41-164.42 33.41-76.94 90.62-134.16 57.21-57.23 133.87-89.99 76.65-32.76 163.13-32.76 87.52 0 164.66 32.76t134.22 90q57.09 57.24 89.92 134.29 32.83 77.06 32.83 164.67 0 86.94-32.76 163.34-32.76 76.39-89.99 133.58-57.22 57.2-134.26 90.61-77.04 33.41-164.63 33.41Zm.31-84q140.51 0 238.92-98.74T817.33-480q0-140.51-98.41-238.92T480-817.33q-139.85 0-238.59 98.41-98.74 98.41-98.74 238.92 0 139.85 98.74 238.59 98.74 98.74 238.59 98.74ZM480-480Z';


// ============================================================
// MOVEMENT SETTINGS
// ============================================================

// Same speed as the previous 30 second CSS animation
const SPEED = 50 / 30;
const BOOST_SPEED = 50;

// --- Smoothness of the finger drag (mobile) ---

// Longest time step (seconds) used for one animation frame, so a slow
// frame never makes the carousel jump.
const MAX_FRAME_SECONDS = 0.05;

// After the finger is lifted, the carousel keeps gliding with the speed
// of the swipe (inertia). Higher = stops sooner.
const INERTIA_DECAY = 2.2;

// Fastest glide allowed after a flick (percent of the sequence per second)
const MAX_INERTIA = 120;

// How quickly the normal automatic movement fades back in after the
// finger is lifted. Higher = returns sooner.
const AUTO_RESUME_RATE = 2.5;

// A flick only produces inertia if the finger was still moving
// within this many milliseconds before being lifted.
const FLICK_MAX_IDLE_MS = 80;


export default function Carousel2() {

    const [currentItem, setCurrentItem] = useState(0);
    const [selectedModel, setSelectedModel] = useState(null);
    const [isImageClicked, setIsImageClicked] = useState(false);

    const iframeRef = useRef(null);
    const carouselRef = useRef(null);
    const sequenceRef = useRef(null);

    const positionRef = useRef(0);
    const animationFrameRef = useRef(null);
    const lastTimeRef = useRef(null);
    const isMovingRef = useRef(true);

    // Touch-drag support (mobile only)
    const isMobileRef = useRef(false);
    const isDraggingRef = useRef(false);
    const touchStartRef = useRef({ x: 0, y: 0, position: 0 });
    const touchDirectionRef = useRef(null);

    // Smooth drag: finger speed, inertia after release, and the
    // fade-in of the automatic movement
    const lastTouchRef = useRef({ x: 0, time: 0 });
    const velocityRef = useRef(0);
    const inertiaRef = useRef(0);
    const autoFactorRef = useRef(1);

    // Temporary button boost
    const boostRef = useRef(0);
    const boostTargetRef = useRef(0);


    function applyPosition(position) {

        if (sequenceRef.current) {
            sequenceRef.current.style.transform =
                `translate3d(${position}%, 0, 0)`;
        }
    }


    function updateCarousel(time) {

        if (!isMovingRef.current) {
            return;
        }

        if (lastTimeRef.current === null) {
            lastTimeRef.current = time;
        }

        // Clamp the step so a slow frame (or coming back to the tab)
        // can never make the carousel jump.
        const deltaTime = Math.min(
            (time - lastTimeRef.current) / 1000,
            MAX_FRAME_SECONDS
        );

        lastTimeRef.current = time;


        /*
         * Smoothly move the current boost
         * towards its target value.
         */
        boostRef.current +=
            (boostTargetRef.current - boostRef.current) *
            Math.min(deltaTime * 8, 1);


        if (isDraggingRef.current) {

            /*
             * The finger is moving the carousel: the automatic
             * movement and any old inertia are switched off.
             */
            autoFactorRef.current = 0;
            inertiaRef.current = 0;

        } else {

            /*
             * The automatic movement fades back in gradually after
             * the finger is lifted, instead of restarting at full
             * speed in a single frame.
             */
            autoFactorRef.current +=
                (1 - autoFactorRef.current) *
                Math.min(deltaTime * AUTO_RESUME_RATE, 1);

            /*
             * Normal movement + temporary button boost + the glide
             * left over from a swipe.
             *
             * Normal movement is to the LEFT.
             *
             * Negative boost = faster LEFT
             * Positive boost = RIGHT
             */
            positionRef.current +=
                (
                    inertiaRef.current -
                    (SPEED * autoFactorRef.current + boostRef.current)
                ) * deltaTime;

            // The glide slows down smoothly
            inertiaRef.current *= Math.exp(-INERTIA_DECAY * deltaTime);

            if (Math.abs(inertiaRef.current) < 0.05) {
                inertiaRef.current = 0;
            }
        }


        /*
         * Infinite loop.
         *
         * The first four images are duplicated by
         * the second four images.
         */
        while (positionRef.current <= -50) {
            positionRef.current += 50;
        }

        while (positionRef.current >= 0) {
            positionRef.current -= 50;
        }


        applyPosition(positionRef.current);


        animationFrameRef.current =
            requestAnimationFrame(updateCarousel);
    }


    function startCarousel() {

        if (isMovingRef.current) {
            return;
        }

        isMovingRef.current = true;
        lastTimeRef.current = null;

        // Ease back into the automatic movement
        autoFactorRef.current = 0;

        if (sequenceRef.current) {
            sequenceRef.current.style.transition = 'none';
        }

        animationFrameRef.current =
            requestAnimationFrame(updateCarousel);
    }


    function stopCarouselSmoothly() {

        if (!isMovingRef.current) {
            return;
        }

        isMovingRef.current = false;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        lastTimeRef.current = null;

        // Remove any active button boost and swipe glide
        boostRef.current = 0;
        boostTargetRef.current = 0;
        inertiaRef.current = 0;


        if (sequenceRef.current) {

            const currentPosition = positionRef.current;

            /*
             * Move forward by the amount the carousel would
             * normally travel during the deceleration period.
             */
            const decelerationTime = 0.3;

            const targetPosition =
                currentPosition - (SPEED * decelerationTime);


            sequenceRef.current.style.transition =
                'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';

            applyPosition(targetPosition);

            positionRef.current = targetPosition;
        }
    }



    // Enable finger dragging only at the mobile breakpoint.
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');

        const updateMobileState = (event) => {
            isMobileRef.current = event.matches;
            isDraggingRef.current = false;
            touchDirectionRef.current = null;
        };

        isMobileRef.current = mediaQuery.matches;
        mediaQuery.addEventListener('change', updateMobileState);

        return () => {
            mediaQuery.removeEventListener('change', updateMobileState);
        };
    }, []);


    function handleTouchStart(event) {
        if (
            !isMobileRef.current ||
            !isMovingRef.current ||
            event.touches.length !== 1
        ) {
            return;
        }

        const touch = event.touches[0];

        isDraggingRef.current = true;
        touchDirectionRef.current = null;

        // A new touch stops any glide from the previous swipe
        inertiaRef.current = 0;
        velocityRef.current = 0;

        lastTouchRef.current = {
            x: touch.clientX,
            time: performance.now()
        };

        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            position: positionRef.current
        };
    }


    function handleTouchMove(event) {
        if (
            !isMobileRef.current ||
            !isDraggingRef.current ||
            event.touches.length !== 1
        ) {
            return;
        }

        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;

        // Decide whether this gesture is horizontal or vertical.
        if (touchDirectionRef.current === null) {
            if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
                return;
            }

            touchDirectionRef.current =
                Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
        }

        // Let the page handle vertical swipes normally.
        if (touchDirectionRef.current !== 'horizontal') {
            isDraggingRef.current = false;
            return;
        }

        // Horizontal movement is ours. The page is not scrolled
        // horizontally because the container has touch-action: pan-y.

        if (!sequenceRef.current) {
            return;
        }

        const sequenceWidth = sequenceRef.current.offsetWidth;
        if (!sequenceWidth) {
            return;
        }

        // Convert finger movement in pixels into translateX percentage.
        let newPosition =
            touchStartRef.current.position + (deltaX / sequenceWidth) * 100;

        // Keep the duplicated sequence inside its infinite-loop range.
        while (newPosition <= -50) newPosition += 50;
        while (newPosition >= 0) newPosition -= 50;

        positionRef.current = newPosition;
        sequenceRef.current.style.transition = 'none';
        applyPosition(newPosition);

        // Measure how fast the finger is moving (percent per second),
        // smoothed over the last few moves. It becomes the glide when
        // the finger is lifted.
        const now = performance.now();
        const seconds = (now - lastTouchRef.current.time) / 1000;

        if (seconds > 0) {
            const stepPercent =
                ((touch.clientX - lastTouchRef.current.x) / sequenceWidth) * 100;

            velocityRef.current =
                velocityRef.current * 0.5 + (stepPercent / seconds) * 0.5;
        }

        lastTouchRef.current = { x: touch.clientX, time: now };
    }


    function handleTouchEnd() {
        if (!isMobileRef.current) {
            return;
        }

        // A quick flick keeps the carousel gliding; a slow drag or a
        // finger that paused before being lifted does not.
        const idleMs = performance.now() - lastTouchRef.current.time;

        if (
            touchDirectionRef.current === 'horizontal' &&
            idleMs < FLICK_MAX_IDLE_MS
        ) {
            inertiaRef.current = Math.max(
                -MAX_INERTIA,
                Math.min(MAX_INERTIA, velocityRef.current)
            );
        } else {
            inertiaRef.current = 0;
        }

        velocityRef.current = 0;
        isDraggingRef.current = false;
        touchDirectionRef.current = null;
        lastTimeRef.current = null;
    }

    function handleImageClick(modelUrl) {

        stopCarouselSmoothly();

        /*
         * Wait for the carousel to finish decelerating,
         * then show the iframe.
         */
        setTimeout(() => {
            setSelectedModel(modelUrl);
            setIsImageClicked(true);
        }, 500);
    }


    function handleRightClick() {

        if (!isMovingRef.current) {
            return;
        }

        /*
         * Positive boost temporarily pushes the
         * carousel to the RIGHT.
         */
        boostTargetRef.current = BOOST_SPEED;

        setTimeout(() => {
            boostTargetRef.current = 0;
        }, 300);
    }


    function handleLeftClick() {

        if (!isMovingRef.current) {
            return;
        }

        /*
         * Negative boost adds to the normal LEFT movement,
         * making the carousel temporarily move faster.
         */
        boostTargetRef.current = -(SPEED + BOOST_SPEED);

        setTimeout(() => {
            boostTargetRef.current = 0;
        }, 300);
    }

    function handleCloseIframe() {

        setSelectedModel(null);
        setIsImageClicked(false);
    }


    useEffect(() => {

        isMovingRef.current = true;

        animationFrameRef.current =
            requestAnimationFrame(updateCarousel);

        return () => {

            isMovingRef.current = false;

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };

    }, []);


    useEffect(() => {

        function handleEscapeClick(event) {

            if (
                iframeRef.current &&
                !iframeRef.current.contains(event.target) &&
                !carouselRef.current.contains(event.target)
            ) {

                setSelectedModel(null);
                setIsImageClicked(false);

                startCarousel();
            }
        }

        document.addEventListener('click', handleEscapeClick);

        return () => {
            document.removeEventListener('click', handleEscapeClick);
        };

    }, []);


    return (

        <div className="carousel2">
            <button
                className="left-arrow-button"
                onClick={handleLeftClick}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                >
                    <path d="m317.5-118.17-31-30.33 333-332.17L286.5-813l31-30.17L680-480.67l-362.5 362.5Z"/>
                </svg>
            </button>


            <div
                className="items-sequence-container"
                ref={carouselRef}
                style={{ touchAction: 'pan-y' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                <div
                    className="items-sequence"
                    ref={sequenceRef}
                    style={{ willChange: 'transform' }}
                >

                    {[...ITEMS, ...ITEMS].map((item, index) => (

                        <div className="img-container" key={index}>
                            <img
                                src={item.image}
                                alt={item.alt}
                                onClick={() => handleImageClick(item.model)}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="40px"
                                viewBox="0 -960 960 960"
                                width="40px"
                                fill="currentColor"
                            >
                                <path d={PLAY_ICON_PATH}/>
                            </svg>
                        </div>

                    ))}

                </div>
            </div>


            <button className="right-arrow-button" onClick={handleRightClick}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                >
                    <path d="m317.5-118.17-31-30.33 333-332.17L286.5-813l31-30.17L680-480.67l-362.5 362.5Z"/>
                </svg>
            </button>


            <iframe
                ref={iframeRef}
                id="item-iframe"
                className={isImageClicked ? 'visible' : ''}
                title="3D Model"
                loading="eager"
                frameBorder="0"
                allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
                src={selectedModel || 'about:blank'}
            ></iframe>


            <button
                className={`close-iframe-button ${isImageClicked ? 'visible' : ''}`}
                onClick={handleCloseIframe}
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    height="24px" 
                    viewBox="0 -960 960 960" 
                    width="24px" 
                    fill="currentColor">
                        <path d="m333-308 147-147 147 147 25-25-147-147 147-147-25-25-147 147-147-147-25 25 147 147-147 147 25 25Zm146.72 192q-75.36 0-141.26-28.91-65.9-28.91-115.23-78.19-49.34-49.28-78.28-115.22Q116-404.27 116-479.83q0-75.44 28.97-141.88 28.97-66.43 78.53-116.04 49.57-49.61 115.15-77.93Q404.24-844 479.38-844q75.51 0 142.25 28.29 66.74 28.28 116.13 77.84 49.39 49.57 77.81 116.09Q844-555.26 844-479.63q0 75.63-28.29 141.03-28.28 65.39-77.83 114.99-49.55 49.6-116.05 78.61-66.5 29-142.11 29Zm.28-35q136.51 0 232.76-96.24Q809-343.49 809-480t-96.24-232.76Q616.51-809 480-809t-232.76 96.24Q151-616.51 151-480t96.24 232.76Q343.49-151 480-151Zm0-329Z"/>
                </svg>
            </button>


            <div id="carousel2-overlay"></div>
        </div>
    );
}