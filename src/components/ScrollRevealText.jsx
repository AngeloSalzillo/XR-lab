import './ScrollRevealText.css';
import { useEffect, useRef, useState } from 'react';

const SCROLL_THRESHOLD = 600;       // wheel distance for EACH stage (desktop)
const TOUCH_SCROLL_THRESHOLD = 120; // finger travel (px) for EACH stage (mobile)
const COOLDOWN_MS = 400;            // ignores inertia after each stage (0 = off)

export default function ScrollRevealText({ lines }) {
    const sectionRef = useRef(null);

    const phaseRef = useRef('idle');   // 'idle' | 'locked' | 'done'
    const lockYRef = useRef(0);
    const accumulatorRef = useRef(0);
    const visibleRef = useRef(0);
    const cooldownUntilRef = useRef(0);
    const touchLastYRef = useRef(null);

    const [visibleLines, setVisibleLines] = useState(0);

    useEffect(() => {
        const total = lines.length;
        const root = document.documentElement;

        const setVisible = (n) => {
            visibleRef.current = n;
            setVisibleLines(n);
        };

        // While locked, tell the browser it must not scroll or pan the page
        // with touch gestures (this is what makes the lock reliable on iOS
        // Safari and Android Chrome). We still receive the touch events.
        const setTouchLock = (locked) => {
            root.style.touchAction = locked ? 'none' : '';
        };

        // Scroll position where the section exactly fills the screen
        const getActivationY = () =>
            sectionRef.current.getBoundingClientRect().top + window.scrollY;

        const jumpTo = (y) =>
            window.scrollTo({ top: y, left: 0, behavior: 'instant' });

        const lock = (y) => {
            phaseRef.current = 'locked';
            lockYRef.current = y;
            accumulatorRef.current = 0;
            touchLastYRef.current = null;
            cooldownUntilRef.current = performance.now() + COOLDOWN_MS;
            setTouchLock(true);
            jumpTo(y);
        };

        // Firefox can report lines/pages instead of pixels
        const getDelta = (e) => {
            if (e.deltaMode === 1) return e.deltaY * 16;
            if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
            return e.deltaY;
        };

        // Page loaded already past the section: show everything, never lock
        if (sectionRef.current && window.scrollY > getActivationY() + 1) {
            phaseRef.current = 'done';
            setVisible(total);
        }

        // Shared by wheel and touch: while locked, a positive delta means
        // "scroll down" and drives the reveal.
        const applyLockedDelta = (delta, threshold) => {
            if (performance.now() < cooldownUntilRef.current) return;

            // Reset the accumulator when the direction changes
            if (Math.sign(delta) !== Math.sign(accumulatorRef.current)) {
                accumulatorRef.current = 0;
            }
            accumulatorRef.current += delta;

            // Scrolling down: reveal the next line; after the last one, one more
            // step releases the page for good
            if (accumulatorRef.current >= threshold) {
                accumulatorRef.current = 0;
                cooldownUntilRef.current = performance.now() + COOLDOWN_MS;

                if (visibleRef.current >= total) {
                    phaseRef.current = 'done';
                    setTouchLock(false);
                } else {
                    setVisible(visibleRef.current + 1);
                }
            }
            // Scrolling up: lines never disappear, it just lets you leave upwards
            else if (accumulatorRef.current <= -threshold) {
                accumulatorRef.current = 0;
                phaseRef.current = 'idle';
                setTouchLock(false);
            }
        };

        /* ====================== WHEEL (desktop) ====================== */

        function handleWheel(event) {
            if (!sectionRef.current) return;

            const phase = phaseRef.current;
            if (phase === 'done') return; // animation already played: free scrolling

            const delta = getDelta(event);

            /* ---------- IDLE: normal scrolling until the section fills the screen ---------- */
            if (phase === 'idle') {
                if (delta <= 0) return;

                const activationY = getActivationY();
                const y = window.scrollY;

                if (y <= activationY && y + delta >= activationY) {
                    event.preventDefault();
                    lock(activationY);
                }
                return;
            }

            /* ---------- LOCKED: wheel drives the reveal ---------- */
            event.preventDefault();
            applyLockedDelta(delta, SCROLL_THRESHOLD);
        }

        /* ====================== TOUCH (mobile) ====================== */

        function handleTouchStart(event) {
            if (phaseRef.current !== 'locked') return;

            touchLastYRef.current = event.touches[0].clientY;
            accumulatorRef.current = 0; // each swipe starts fresh
        }

        function handleTouchMove(event) {
            if (!sectionRef.current) return;
            if (phaseRef.current !== 'locked') return;

            // Stop the browser from scrolling the page while locked.
            // (Not cancelable if the browser already started scrolling in
            // this same gesture; handleScroll pins the page in that case.)
            if (event.cancelable) {
                event.preventDefault();
            }

            const currentY = event.touches[0].clientY;

            if (touchLastYRef.current === null) {
                touchLastYRef.current = currentY;
                return;
            }

            // Finger moving UP = scrolling DOWN = positive delta
            const delta = touchLastYRef.current - currentY;
            touchLastYRef.current = currentY;

            applyLockedDelta(delta, TOUCH_SCROLL_THRESHOLD);
        }

        function handleTouchEnd() {
            touchLastYRef.current = null;
        }

        /* ====================== SCROLL (safety net) ====================== */
        // Scrollbar drag, keyboard, touch momentum...

        function handleScroll() {
            if (!sectionRef.current) return;

            const phase = phaseRef.current;
            if (phase === 'done') return;

            if (phase === 'locked') {
                if (Math.abs(window.scrollY - lockYRef.current) > 1) {
                    jumpTo(lockYRef.current);
                }
                return;
            }

            // idle: if we went past the activation point, pull back and lock
            const activationY = getActivationY();
            if (window.scrollY > activationY) {
                lock(activationY);
            }
        }

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
            window.removeEventListener('scroll', handleScroll);
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