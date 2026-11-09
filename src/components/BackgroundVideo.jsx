import './BackgroundVideo.css';
import { useEffect, useRef, useState } from 'react';

/*
 * Background video that:
 *  - never shows the browser's own play button, even when the browser
 *    blocks autoplay (iOS Low Power Mode):
 *      1. CSS hides the native button (BackgroundVideo.css);
 *      2. if autoplay is blocked, the video is hidden (the native button
 *         lives inside the <video>, so it disappears with it). If a
 *         `poster` is given it is shown in its place, otherwise the
 *         background behind the video shows through;
 *  - starts on the first tap/click if autoplay was blocked, and one tap
 *    starts every video on the page;
 *  - resumes after the page returns from the background (app switch,
 *    locked screen, tab switch).
 *
 * Usage:
 *   <BackgroundVideo
 *       className="some-class"      (optional)
 *       poster={posterImage}        (optional, shown while autoplay is blocked)
 *       sources={[
 *           { src: videoH265, type: 'video/mp4; codecs="hvc1"' },
 *           { src: videoH264, type: 'video/mp4' },
 *       ]}
 *   />
 *
 * The element that contains this component must be positioned
 * (position: relative / absolute / sticky), as your background
 * containers already are, so the poster can fill it.
 */
export default function BackgroundVideo({ sources, className, poster }) {

    const videoRef = useRef(null);

    // True when the browser refused to autoplay the video.
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);

    useEffect(() => {

        const video = videoRef.current;

        if (!video) return;

        // React sets `muted` as a property but does not write the HTML
        // attribute. Set both explicitly.
        video.defaultMuted = true;
        video.muted = true;

        // One play() attempt tells us whether autoplay is allowed. If the
        // browser blocks it (Low Power Mode), the promise rejects at once.
        const firstAttempt = video.play();

        if (firstAttempt && typeof firstAttempt.catch === 'function') {
            firstAttempt.catch((error) => {
                if (error && error.name === 'NotAllowedError') {
                    setAutoplayBlocked(true);
                }
            });
        }

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

        // Autoplay blocked: a tap (a real user gesture) is allowed to start
        // playback. Every BackgroundVideo on the page listens, so a single
        // tap starts all of them. Scrolling alone does not count as a
        // gesture for the browser, so a tap or click is needed.
        const handleUserGesture = () => {
            resume();
        };

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
        <>
            <video
                ref={videoRef}
                className={className ? `background-video ${className}` : 'background-video'}
                autoPlay
                muted
                loop
                playsInline
                onPlaying={() => setAutoplayBlocked(false)}
                style={autoplayBlocked ? { visibility: 'hidden' } : undefined}
            >
                {sources.map((source) => (
                    <source
                        key={source.src}
                        src={source.src}
                        type={source.type}
                    />
                ))}
            </video>

            {autoplayBlocked && poster && (
                <img
                    src={poster}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        pointerEvents: 'none',
                    }}
                />
            )}
        </>
    );
}