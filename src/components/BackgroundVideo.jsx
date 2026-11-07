import { useEffect, useRef } from 'react';

/*
 * Background video that keeps playing.
 *
 * Mobile browsers (especially iOS Safari) pause videos when the page goes
 * to the background (app switch, locked screen, tab switch) and do NOT
 * resume them when the user comes back. This component resumes playback
 * in every situation where that can happen.
 *
 * Usage:
 *   <BackgroundVideo
 *       className="desktop-background"
 *       sources={[
 *           { src: videoH265, type: 'video/mp4; codecs="hvc1"' },
 *           { src: videoH264, type: 'video/mp4' },
 *       ]}
 *   />
 */
export default function BackgroundVideo({ sources, className }) {

    const videoRef = useRef(null);

    useEffect(() => {

        const video = videoRef.current;

        if (!video) return;

        const tryPlay = () => {

            if (document.hidden || video.ended) return;

            const result = video.play();

            // play() returns a promise that can reject (autoplay blocked,
            // Low Power Mode...). Nothing to do in that case: the
            // interaction listeners below will retry on the next touch.
            if (result && typeof result.catch === 'function') {
                result.catch(() => { });
            }
        };

        // Page becomes visible again (app switch, tab switch, unlock).
        const handleVisibilityChange = () => {
            if (!document.hidden) tryPlay();
        };

        // Page restored from the back/forward cache.
        const handlePageShow = () => {
            tryPlay();
        };

        // The browser paused the video on its own while the page is
        // visible (iOS does this in several situations). Resume it.
        const handlePause = () => {
            if (!document.hidden && !video.ended) {
                tryPlay();
            }
        };

        // Fallback: if autoplay was blocked (for example iOS Low Power
        // Mode), start the video on the first touch or click.
        const handleFirstInteraction = () => {
            if (video.paused) tryPlay();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pageshow', handlePageShow);
        window.addEventListener('focus', handlePageShow);
        video.addEventListener('pause', handlePause);

        window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
        window.addEventListener('click', handleFirstInteraction);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pageshow', handlePageShow);
            window.removeEventListener('focus', handlePageShow);
            video.removeEventListener('pause', handlePause);

            window.removeEventListener('touchstart', handleFirstInteraction);
            window.removeEventListener('click', handleFirstInteraction);
        };

    }, []);

    return (
        <video
            ref={videoRef}
            className={className}
            autoPlay
            muted
            loop
            playsInline
        >
            {sources.map((source) => (
                <source
                    key={source.src}
                    src={source.src}
                    type={source.type}
                />
            ))}
        </video>
    );
}