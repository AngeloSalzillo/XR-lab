import { useEffect, useRef } from 'react';

/*
 * Background video that:
 *  - autoplays muted and looped;
 *  - if the browser blocks autoplay (e.g. iOS Low Power Mode), it leaves
 *    the browser's native play button visible, which is the normal
 *    behaviour;
 *  - starts on the first tap/click anywhere on the page if autoplay was
 *    blocked (so it still works when something covers the native button),
 *    and one tap starts every BackgroundVideo on the page;
 *  - resumes after the page returns from the background (app switch,
 *    locked screen, tab switch).
 *
 * Usage:
 *   <BackgroundVideo
 *       className="some-class"      (optional)
 *       poster={posterImage}        (optional, native video poster)
 *       sources={[
 *           { src: videoH265, type: 'video/mp4; codecs="hvc1"' },
 *           { src: videoH264, type: 'video/mp4' },
 *       ]}
 *   />
 */
export default function BackgroundVideo({ sources, className, poster }) {

    const videoRef = useRef(null);

    useEffect(() => {

        const video = videoRef.current;

        if (!video) return;

        // React sets `muted` as a property but does not write the HTML
        // attribute. Set both explicitly.
        video.defaultMuted = true;
        video.muted = true;

        const resume = () => {

            if (document.hidden || video.ended || !video.paused) return;

            const result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(() => { });
            }
        };

        // The user comes back to the page (app switch, tab switch, unlock).
        const handleVisibilityChange = () => {
            if (!document.hidden) resume();
        };

        // Page restored from the back/forward cache (not a normal load).
        const handlePageShow = (event) => {
            if (event.persisted) resume();
        };

        // A tap/click is a real user gesture, so the browser allows play().
        // Every BackgroundVideo on the page listens, so one tap starts them
        // all. Scrolling alone does not count as a gesture.
        const handleUserGesture = () => resume();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pageshow', handlePageShow);
        window.addEventListener('touchend', handleUserGesture, { passive: true });
        window.addEventListener('click', handleUserGesture);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pageshow', handlePageShow);
            window.removeEventListener('touchend', handleUserGesture);
            window.removeEventListener('click', handleUserGesture);
        };

    }, []);

    return (
        <video
            ref={videoRef}
            className={className ? `background-video ${className}` : 'background-video'}
            poster={poster}
            preload="auto"
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