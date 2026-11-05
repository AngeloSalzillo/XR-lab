import React, {
    useMemo,
    useRef,
    useEffect,
    useCallback,
    useState,
    useId,
} from 'react';


// ============================================================
// RESPONSIVE CARD SETTINGS
// ============================================================

const DESKTOP_CARD_RATIO = 16 / 9;
const MOBILE_CARD_RATIO = 9 / 16;

const DESKTOP_CARD_WIDTH_RATIO = 0.40;
const MOBILE_CARD_WIDTH_RATIO = 0.60;

const DESKTOP_MIN_CARD_WIDTH = 260;
const DESKTOP_MAX_CARD_WIDTH = 560;

const MOBILE_MIN_CARD_WIDTH = 130;
const MOBILE_MAX_CARD_WIDTH = 300;


// ============================================================
// ANIMATION SETTINGS
// ============================================================

const AUTOSPIN_SPEED = 0.05;
const ROTATION_SMOOTHING = 0.08;


// ============================================================
// INDIVIDUAL CARD
// ============================================================

const Card = React.memo(function Card({
    children,
    transform,
    cardW,
    cardH,
    index,
    onCenter,
}) {
    return (
        <div
            data-carousel-card-index={index}
            onClick={() => onCenter(index)}
            style={{
                width: cardW,
                height: cardH,
                position: 'absolute',
                left: 0,
                top: 0,
                transform,
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
                willChange: 'transform',
                pointerEvents: 'auto',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'black',
                    position: 'relative',
                }}
            >
                {children}
            </div>
        </div>
    );
});


// ============================================================
// MAIN CAROUSEL
// ============================================================

export default function ThreeDCarousel({
    id,
    children,
}) {

    // --------------------------------------------------------
    // UNIQUE INSTANCE ID
    // --------------------------------------------------------

    const generatedId = useId();

    const carouselId = id ||
        `three-d-carousel-${generatedId.replace(/:/g, '')}`;


    // --------------------------------------------------------
    // REFERENCES
    // --------------------------------------------------------

    const parentRef = useRef(null);
    const wheelRef = useRef(null);

    // Each carousel manages its own YouTube players.
    const youtubePlayersRef = useRef([]);

    const playingPlayerRef = useRef(null);
    const centeringCardIndexRef = useRef(null);

    const rotationRef = useRef(0);
    const targetRotationRef = useRef(null);


    // --------------------------------------------------------
    // MOBILE DETECTION
    // --------------------------------------------------------

    const [isMobile, setIsMobile] = useState(() =>
        window.matchMedia('(max-width: 768px)').matches
    );

    useEffect(() => {

        const mediaQuery =
            window.matchMedia('(max-width: 768px)');

        const handleResize = (event) => {
            setIsMobile(event.matches);
        };

        mediaQuery.addEventListener('change', handleResize);

        return () => {
            mediaQuery.removeEventListener(
                'change',
                handleResize
            );
        };

    }, []);

    // Lets the animation loop read the latest isMobile value
    // without having to be re-created.
    const isMobileRef = useRef(isMobile);


    // --------------------------------------------------------
    // OBSERVE CAROUSEL WIDTH
    // --------------------------------------------------------

    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {

        const element = parentRef.current;

        if (!element) return;

        const updateWidth = () => {
            setContainerWidth(
                element.getBoundingClientRect().width
            );
        };

        updateWidth();

        const observer = new ResizeObserver((entries) => {

            const width = entries[0]?.contentRect.width;

            if (width !== undefined) {
                setContainerWidth(width);
            }
        });

        observer.observe(element);

        return () => observer.disconnect();

    }, []);


    // --------------------------------------------------------
    // RESPONSIVE DIMENSIONS
    // --------------------------------------------------------

    const effectiveCardW = useMemo(() => {

        if (containerWidth <= 0) {
            return isMobile
                ? MOBILE_MIN_CARD_WIDTH
                : DESKTOP_MIN_CARD_WIDTH;
        }

        const widthRatio = isMobile
            ? MOBILE_CARD_WIDTH_RATIO
            : DESKTOP_CARD_WIDTH_RATIO;

        const minWidth = isMobile
            ? MOBILE_MIN_CARD_WIDTH
            : DESKTOP_MIN_CARD_WIDTH;

        const maxWidth = isMobile
            ? MOBILE_MAX_CARD_WIDTH
            : DESKTOP_MAX_CARD_WIDTH;

        return Math.min(
            maxWidth,
            Math.max(
                minWidth,
                containerWidth * widthRatio
            )
        );

    }, [containerWidth, isMobile]);


    const effectiveCardH = useMemo(() => {

        const aspectRatio = isMobile
            ? MOBILE_CARD_RATIO
            : DESKTOP_CARD_RATIO;

        return effectiveCardW / aspectRatio;

    }, [effectiveCardW, isMobile]);


    const effectiveRadius = useMemo(() => {

        const factor = isMobile ? 1.94 : 1.4;

        return effectiveCardW * factor;

    }, [effectiveCardW, isMobile]);


    // --------------------------------------------------------
    // VERTICAL SPACE
    // --------------------------------------------------------

    const carouselHeight = Math.max(
        effectiveCardH + 120,
        420
    );


    // --------------------------------------------------------
    // CAROUSEL ITEMS
    // --------------------------------------------------------

    const items = useMemo(
        () => React.Children.toArray(children),
        [children]
    );

    const cardCount = items.length;

    const anglePerCard =
        cardCount > 0 ? 360 / cardCount : 0;


    const cards = useMemo(() => {

        if (items.length === 0) return [];

        return items.map((item, index) => ({

            key: item.key ?? index,

            item,

            index,

            transform:
                `rotateY(${(index * 360) / items.length}deg) ` +
                `translateZ(${effectiveRadius}px)`,

        }));

    }, [items, effectiveRadius]);


    // --------------------------------------------------------
    // MOBILE: KEEP REF IN SYNC + SNAP TO NEAREST CARD
    // --------------------------------------------------------
    // When the viewport becomes mobile (for example after a resize
    // while the carousel is mid-spin), ease to the closest card so
    // the carousel rests exactly on a card instead of between two.

    useEffect(() => {

        isMobileRef.current = isMobile;

        if (
            !isMobile ||
            cardCount === 0 ||
            playingPlayerRef.current !== null
        ) {
            return;
        }

        const current =
            targetRotationRef.current ?? rotationRef.current;

        const nearestIndex =
            Math.round(-current / anglePerCard);

        targetRotationRef.current =
            -nearestIndex * anglePerCard;

    }, [isMobile, cardCount, anglePerCard]);


    // --------------------------------------------------------
    // PAUSE PLAYER
    // --------------------------------------------------------

    const pausePlayer = useCallback((player) => {

        if (!player) return;

        try {

            if (typeof player.pauseVideo === 'function') {
                player.pauseVideo();
            }

        } catch (error) {

            console.warn(
                'Unable to pause YouTube player:',
                error
            );
        }

        if (playingPlayerRef.current === player) {
            playingPlayerRef.current = null;
        }

    }, []);


    // --------------------------------------------------------
    // PAUSE OTHER PLAYERS IN THIS CAROUSEL
    // --------------------------------------------------------

    const pauseOtherPlayers = useCallback((currentPlayer) => {

        youtubePlayersRef.current.forEach((otherPlayer) => {

            if (otherPlayer === currentPlayer) return;

            try {

                if (
                    typeof otherPlayer.pauseVideo === 'function'
                ) {
                    otherPlayer.pauseVideo();
                }

            } catch {
                // Player might not be ready.
            }
        });

    }, []);


    // --------------------------------------------------------
    // CENTER CARD
    // --------------------------------------------------------

    const handleCardClick = useCallback((index) => {

        if (
            cardCount === 0 ||
            index < 0 ||
            index >= cardCount
        ) {
            return;
        }

        const currentTarget =
            targetRotationRef.current ?? rotationRef.current;

        const desiredRotation =
            -index * anglePerCard;

        const nearestFullRotation =
            Math.round(
                (currentTarget - desiredRotation) / 360
            ) * 360;

        const newTarget =
            desiredRotation + nearestFullRotation;

        if (playingPlayerRef.current !== null) {
            pausePlayer(playingPlayerRef.current);
        }

        centeringCardIndexRef.current = index;

        targetRotationRef.current = newTarget;

    }, [
        cardCount,
        anglePerCard,
        pausePlayer,
    ]);


    // --------------------------------------------------------
    // LEFT ARROW
    // --------------------------------------------------------

    const handleLeftClick = useCallback(() => {

        if (
            cardCount < 2 ||
            centeringCardIndexRef.current !== null
        ) {
            return;
        }

        // Pause the video currently playing in this carousel, if any.
        if (playingPlayerRef.current !== null) {
            pausePlayer(playingPlayerRef.current);
        }

        // Find the card currently closest to the centre.
        const currentTarget =
            targetRotationRef.current ?? rotationRef.current;

        const currentIndex =
            ((Math.round(-currentTarget / anglePerCard) % cardCount) +
                cardCount) % cardCount;

        // The left arrow selects the immediately previous card.
        const nextIndex =
            (currentIndex - 1 + cardCount) % cardCount;

        const desiredRotation =
            -nextIndex * anglePerCard;

        // Choose the equivalent rotation closest to the current position.
        const nearestFullRotation =
            Math.round(
                (currentTarget - desiredRotation) / 360
            ) * 360;

        targetRotationRef.current =
            desiredRotation + nearestFullRotation;

    }, [cardCount, anglePerCard, pausePlayer]);


    // --------------------------------------------------------
    // RIGHT ARROW
    // --------------------------------------------------------

    const handleRightClick = useCallback(() => {

        if (
            cardCount < 2 ||
            centeringCardIndexRef.current !== null
        ) {
            return;
        }

        // Pause the video currently playing in this carousel, if any.
        if (playingPlayerRef.current !== null) {
            pausePlayer(playingPlayerRef.current);
        }

        // Find the card currently closest to the centre.
        const currentTarget =
            targetRotationRef.current ?? rotationRef.current;

        const currentIndex =
            ((Math.round(-currentTarget / anglePerCard) % cardCount) +
                cardCount) % cardCount;

        // The right arrow selects the immediately next card.
        const nextIndex =
            (currentIndex + 1) % cardCount;

        const desiredRotation =
            -nextIndex * anglePerCard;

        // Choose the equivalent rotation closest to the current position.
        const nearestFullRotation =
            Math.round(
                (currentTarget - desiredRotation) / 360
            ) * 360;

        targetRotationRef.current =
            desiredRotation + nearestFullRotation;

    }, [cardCount, anglePerCard, pausePlayer]);


    // --------------------------------------------------------
    // YOUTUBE IFRAME API
    // --------------------------------------------------------

    useEffect(() => {

        let cancelled = false;

        let previousReadyCallback = null;
        let installedReadyCallback = null;

        const initializedPlayers = [];


        const initializePlayers = () => {

            if (
                cancelled ||
                !parentRef.current ||
                !window.YT?.Player
            ) {
                return;
            }

            const iframes =
                parentRef.current.querySelectorAll('iframe');

            iframes.forEach((iframe, index) => {

                if (
                    !iframe.src.includes('youtube.com/embed/')
                ) {
                    return;
                }

                if (
                    iframe.dataset.youtubeInitialized === 'true'
                ) {
                    return;
                }

                const url = new URL(
                    iframe.src,
                    window.location.href
                );

                url.searchParams.set('enablejsapi', '1');

                url.searchParams.set(
                    'origin',
                    window.location.origin
                );

                iframe.src = url.toString();

                iframe.id =
                    `${carouselId}-youtube-${index}`;

                iframe.dataset.youtubeInitialized = 'true';

                const cardElement = iframe.closest(
                    '[data-carousel-card-index]'
                );

                const cardIndex = cardElement
                    ? Number(
                        cardElement.dataset.carouselCardIndex
                    )
                    : -1;

                try {

                    const player = new window.YT.Player(
                        iframe.id,
                        {
                            events: {

                                onReady: (event) => {

                                    if (
                                        !youtubePlayersRef.current.includes(
                                            event.target
                                        )
                                    ) {
                                        youtubePlayersRef.current.push(
                                            event.target
                                        );
                                    }
                                },


                                onStateChange: (event) => {

                                    // VIDEO STARTED PLAYING
                                    if (event.data === 1) {

                                        pauseOtherPlayers(event.target);

                                        playingPlayerRef.current =
                                            event.target;


                                        // Center the card that started
                                        // playing.
                                        if (
                                            centeringCardIndexRef.current === null &&
                                            cardIndex >= 0
                                        ) {

                                            const desiredRotation =
                                                -cardIndex * anglePerCard;

                                            const nearestFullRotation =
                                                Math.round(
                                                    (
                                                        rotationRef.current -
                                                        desiredRotation
                                                    ) / 360
                                                ) * 360;

                                            const newTarget =
                                                desiredRotation +
                                                nearestFullRotation;

                                            if (
                                                Math.abs(
                                                    newTarget -
                                                    rotationRef.current
                                                ) >= 0.1
                                            ) {

                                                centeringCardIndexRef.current =
                                                    cardIndex;

                                                targetRotationRef.current =
                                                    newTarget;
                                            }
                                        }
                                    }


                                    // VIDEO ENDED OR PAUSED
                                    if (
                                        event.data === 0 ||
                                        event.data === 2
                                    ) {

                                        if (
                                            playingPlayerRef.current ===
                                            event.target
                                        ) {
                                            playingPlayerRef.current = null;
                                        }
                                    }
                                },
                            },
                        }
                    );

                    initializedPlayers.push(player);

                } catch (error) {

                    console.error(
                        'Unable to initialize YouTube player:',
                        error
                    );

                    delete iframe.dataset.youtubeInitialized;
                }
            });
        };


        // LOAD YOUTUBE API

        const loadAPI = () => {

            if (window.YT?.Player) {
                initializePlayers();
                return;
            }

            previousReadyCallback =
                window.onYouTubeIframeAPIReady;

            installedReadyCallback = () => {

                if (
                    typeof previousReadyCallback === 'function'
                ) {
                    previousReadyCallback();
                }

                initializePlayers();
            };

            window.onYouTubeIframeAPIReady =
                installedReadyCallback;

            const existingScript = document.querySelector(
                'script[src="https://www.youtube.com/iframe_api"]'
            );

            if (!existingScript) {

                const script = document.createElement('script');

                script.src =
                    'https://www.youtube.com/iframe_api';

                script.async = true;

                document.head.appendChild(script);
            }
        };


        loadAPI();


        // CLEANUP

        return () => {

            cancelled = true;

            if (
                window.onYouTubeIframeAPIReady ===
                installedReadyCallback
            ) {
                window.onYouTubeIframeAPIReady =
                    previousReadyCallback;
            }

            initializedPlayers.forEach((player) => {

                try {
                    player.destroy();
                } catch {
                    // Ignore players that weren't fully initialized.
                }
            });

            youtubePlayersRef.current = [];

            playingPlayerRef.current = null;

            centeringCardIndexRef.current = null;
        };

    }, [
        carouselId,
        anglePerCard,
        pauseOtherPlayers,
    ]);


    // --------------------------------------------------------
    // MAIN ANIMATION LOOP
    // --------------------------------------------------------

    useEffect(() => {

        let frameId;

        const animate = () => {

            // HORIZONTAL ROTATION ONLY.
            // The wheel's X rotation is permanently zero.

            if (
                centeringCardIndexRef.current !== null &&
                targetRotationRef.current !== null
            ) {

                const difference =
                    targetRotationRef.current -
                    rotationRef.current;

                if (Math.abs(difference) < 0.1) {

                    rotationRef.current =
                        targetRotationRef.current;

                    targetRotationRef.current = null;

                    centeringCardIndexRef.current = null;

                } else {

                    rotationRef.current +=
                        difference * ROTATION_SMOOTHING;
                }

            } else if (
                playingPlayerRef.current !== null
            ) {

                targetRotationRef.current = null;

            } else if (
                targetRotationRef.current !== null
            ) {

                const difference =
                    targetRotationRef.current -
                    rotationRef.current;

                if (Math.abs(difference) < 0.1) {

                    rotationRef.current =
                        targetRotationRef.current;

                    targetRotationRef.current = null;

                    centeringCardIndexRef.current = null;

                } else {

                    rotationRef.current +=
                        difference * ROTATION_SMOOTHING;
                }

            } else {

                // AUTOSPIN: DESKTOP ONLY.
                // On mobile the carousel stays still until the arrow
                // buttons (or a card click / video play) move it.

                if (!isMobileRef.current) {
                    rotationRef.current += AUTOSPIN_SPEED;
                }
            }


            // APPLY HORIZONTAL ROTATION.
            // rotateX is explicitly fixed at 0 degrees.

            if (wheelRef.current) {

                wheelRef.current.style.transform =
                    `rotateX(0deg) rotateY(${rotationRef.current}deg)`;
            }

            frameId = requestAnimationFrame(animate);
        };


        frameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameId);
        };

    }, []);


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div
            id={id}
            ref={parentRef}
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: '100%',
                overflow: 'visible',

                height: carouselHeight,
                minHeight: carouselHeight,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                userSelect: 'none',
                touchAction: 'pan-y',
            }}
        >

            {/* LEFT ARROW */}

            <button
                type="button"
                className="left-arrow-button"
                aria-label="Previous card"
                onClick={handleLeftClick}
                style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(50%)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                >
                    <path d="m317.5-118.17-31-30.33 333-332.17L286.5-813l31-30.17L680-480.67l-362.5 362.5Z" />
                </svg>
            </button>


            {/* RIGHT ARROW */}

            <button
                type="button"
                className="right-arrow-button"
                aria-label="Next card"
                onClick={handleRightClick}
                style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                >
                    <path d="m317.5-118.17-31-30.33 333-332.17L286.5-813l31-30.17L680-480.67l-362.5 362.5Z" />
                </svg>
            </button>


            {/* 3D PERSPECTIVE CONTAINER */}

            <div
                style={{
                    position: 'relative',
                    perspective: 1500,
                    perspectiveOrigin: 'center center',

                    width: '100%',
                    maxWidth: '100%',
                    height: carouselHeight,

                    flexShrink: 0,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    overflow: 'visible',
                }}
            >

                {/* ROTATING WHEEL */}

                <div
                    ref={wheelRef}
                    style={{
                        width: effectiveCardW,
                        height: effectiveCardH,

                        transformStyle: 'preserve-3d',
                        willChange: 'transform',

                        position: 'absolute',

                        left: '50%',
                        top: '50%',

                        marginLeft: -effectiveCardW / 2,
                        marginTop: -effectiveCardH / 2,
                    }}
                >

                    {cards.map((card) => (

                        <Card
                            key={card.key}
                            index={card.index}
                            transform={card.transform}
                            cardW={effectiveCardW}
                            cardH={effectiveCardH}
                            onCenter={handleCardClick}
                        >
                            {card.item}
                        </Card>

                    ))}

                </div>

            </div>

        </div>
    );
}