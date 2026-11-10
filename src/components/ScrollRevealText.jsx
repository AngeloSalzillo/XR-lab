import './ScrollRevealText.css';
import { useEffect, useRef, useState } from 'react';

// ------------------------------------------------------------
// TRIGGER
// ------------------------------------------------------------
// The user scrolls normally. The moment the top of the section gets above
// this fraction of the screen height (measured from the top of the screen),
// the page is brought automatically to the section, without waiting for
// the user to stop scrolling.
//   0.5 = the section's top edge reaches the middle of the screen
//   1.0 = as soon as the section's top edge enters at the bottom
//   0.0 = only when the section already fills the screen
const TRIGGER_VIEWPORT_RATIO = 0.6;

// ------------------------------------------------------------
// TIMING (milliseconds)
// ------------------------------------------------------------
const FIRST_LINE_DELAY_MS = 800;  // pause between arriving at the section and the first line
const LINE_INTERVAL_MS = 1400;    // pause between one line and the next
const END_DELAY_MS = 0;           // pause after the last line, before the page is released

// Safety limits for the automatic scroll
const AUTO_SCROLL_STALL_MS = 300;     // scroll stopped moving for this long = it was interrupted
const AUTO_SCROLL_MAX_MS = 500;       // native smooth scroll gets at most this long
const FALLBACK_SCROLL_MS = 300;       // if it was interrupted, finish the trip manually in this time

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export default function ScrollRevealText({ lines }) {
    const sectionRef = useRef(null);

    // 'idle'      : normal free scrolling, waiting to reach the trigger point
    // 'scrolling' : automatic scroll to the section
    // 'locked'    : page held still while the lines appear
    // 'done'      : animation finished, free scrolling
    const phaseRef = useRef('idle');

    const lockYRef = useRef(0);
    const timersRef = useRef([]);
    const frameRef = useRef(null);

    const [visibleLines, setVisibleLines] = useState(0);

    useEffect(() => {
        const total = lines.length;
        const root = document.documentElement;

        const clearTimers = () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };

        const cancelWatcher = () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
        };

        // While the page is automatically scrolling or locked, tell the
        // browser it must not scroll or pan with touch gestures (this is
        // what makes the lock reliable on iOS Safari and Android Chrome).
        const setTouchLock = (locked) => {
            root.style.touchAction = locked ? 'none' : '';
        };

        // Scroll position where the section exactly fills the screen
        const getActivationY = () =>
            sectionRef.current.getBoundingClientRect().top + window.scrollY;

        const jumpTo = (y) =>
            window.scrollTo({ top: y, left: 0, behavior: 'instant' });

        // Is the section's top edge at or above the trigger point?
        const isPastTrigger = () =>
            sectionRef.current.getBoundingClientRect().top <=
            window.innerHeight * TRIGGER_VIEWPORT_RATIO;

        // Reveals the lines one by one on a timer, then releases the page.
        const startSequence = () => {
            clearTimers();

            for (let i = 0; i < total; i++) {
                const id = setTimeout(() => {
                    setVisibleLines(i + 1);
                }, FIRST_LINE_DELAY_MS + i * LINE_INTERVAL_MS);

                timersRef.current.push(id);
            }

            const releaseId = setTimeout(() => {
                phaseRef.current = 'done';
                setTouchLock(false);
            }, FIRST_LINE_DELAY_MS + (total - 1) * LINE_INTERVAL_MS + END_DELAY_MS);

            timersRef.current.push(releaseId);
        };

        const lock = (y) => {
            cancelWatcher();
            phaseRef.current = 'locked';
            lockYRef.current = y;
            setTouchLock(true);
            jumpTo(y);
            startSequence();
        };

        // Finishes the trip to the section by moving the page ourselves,
        // frame by frame. Used when the native smooth scroll was
        // interrupted (the user's finger or the inertia of their swipe
        // can cancel it). Being immune to that, this always arrives.
        const finishManually = (fromY, toY) => {
            cancelWatcher();

            const dist = toY - fromY;

            if (dist <= 1) {
                lock(toY);
                return;
            }

            const t0 = performance.now();

            const step = (now) => {
                const progress = Math.min((now - t0) / FALLBACK_SCROLL_MS, 1);

                jumpTo(fromY + dist * easeOutCubic(progress));

                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(step);
                } else {
                    frameRef.current = null;
                    lock(toY);
                }
            };

            frameRef.current = requestAnimationFrame(step);
        };

        // Goes to the section as soon as it is called. It first tries the
        // browser's NATIVE smooth scrolling (off the main thread, so it
        // stays fluid on a heavy page). If that gets interrupted or takes
        // too long, it finishes the trip manually. Once there, it locks
        // the page and starts the sequence.
        const startAutoScroll = () => {
            const targetY = getActivationY();
            const startY = window.scrollY;

            // Already there (or past it): just lock
            if (targetY - startY <= 1) {
                lock(targetY);
                return;
            }

            phaseRef.current = 'scrolling';
            setTouchLock(true);

            window.scrollTo({ top: targetY, left: 0, behavior: 'smooth' });

            const startTime = performance.now();
            let lastY = startY;
            let lastMoveTime = startTime;

            const watch = (now) => {
                const y = window.scrollY;

                // Arrived (or momentum carried the page past it)
                if (y >= targetY - 1) {
                    lock(targetY);
                    return;
                }

                if (y !== lastY) {
                    lastY = y;
                    lastMoveTime = now;
                }

                const stalled = now - lastMoveTime > AUTO_SCROLL_STALL_MS;
                const timedOut = now - startTime > AUTO_SCROLL_MAX_MS;

                // Interrupted or too slow: finish it ourselves
                if (stalled || timedOut) {
                    finishManually(y, targetY);
                    return;
                }

                frameRef.current = requestAnimationFrame(watch);
            };

            frameRef.current = requestAnimationFrame(watch);
        };

        // Page loaded already past the section: show everything, never lock
        if (sectionRef.current && window.scrollY > getActivationY() + 1) {
            phaseRef.current = 'done';
            setVisibleLines(total);
        }

        /* ====================== WHEEL (desktop) ====================== */
        // Only used to keep the page still during the automatic scroll
        // and while the lines appear. Before that, scrolling is free.

        function handleWheel(event) {
            const phase = phaseRef.current;

            if (phase === 'scrolling' || phase === 'locked') {
                event.preventDefault();
            }
        }

        /* ====================== TOUCH (mobile) ====================== */

        function handleTouchMove(event) {
            const phase = phaseRef.current;

            // Not cancelable if the browser already started scrolling in
            // this same gesture; the scroll handler and the automatic
            // scroll keep control of the page in that case.
            if (
                (phase === 'scrolling' || phase === 'locked') &&
                event.cancelable
            ) {
                event.preventDefault();
            }
        }

        /* ====================== SCROLL ====================== */

        function handleScroll() {
            if (!sectionRef.current) return;

            const phase = phaseRef.current;

            // Our own automatic scroll is moving the page: nothing to do
            if (phase === 'done' || phase === 'scrolling') return;

            // Locked: pin the page (scrollbar drag, keyboard, momentum...)
            if (phase === 'locked') {
                if (Math.abs(window.scrollY - lockYRef.current) > 1) {
                    jumpTo(lockYRef.current);
                }
                return;
            }

            // Idle: the moment the trigger point is passed, go to the section
            if (isPastTrigger()) {
                startAutoScroll();
            }
        }

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('scroll', handleScroll);
            cancelWatcher();
            clearTimers();
            setTouchLock(false);
        };
    }, [lines.length]);

    return (
        <section
            ref={sectionRef}
            style={{
                width: '100%',
                height: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <h2
                className="scroll-reveal-text smooch-sans-thin"
                style={{ margin: 0 }}
            >
                {lines.map((line, index) => (
                    <span key={index} className={index < visibleLines ? 'visible' : ''}>
                        {line}
                    </span>
                ))}
            </h2>
        </section>
    );
}