import './ScrollRevealText.css';
import { useEffect, useRef, useState } from 'react';

const SCROLL_THRESHOLD = 600; // wheel distance for EACH stage
const COOLDOWN_MS = 400;      // ignores trackpad inertia after each stage (0 = off)

export default function ScrollRevealText({ lines }) {
    const sectionRef = useRef(null);

    const phaseRef = useRef('idle');   // 'idle' | 'locked' | 'done'
    const lockYRef = useRef(0);
    const accumulatorRef = useRef(0);
    const visibleRef = useRef(0);
    const cooldownUntilRef = useRef(0);

    const [visibleLines, setVisibleLines] = useState(0);

    useEffect(() => {
        const total = lines.length;

        const setVisible = (n) => {
            visibleRef.current = n;
            setVisibleLines(n);
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
            cooldownUntilRef.current = performance.now() + COOLDOWN_MS;
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

            if (performance.now() < cooldownUntilRef.current) return;

            // Reset the accumulator when the direction changes
            if (Math.sign(delta) !== Math.sign(accumulatorRef.current)) {
                accumulatorRef.current = 0;
            }
            accumulatorRef.current += delta;

            // Scrolling down: reveal the next line; after the last one, one more
            // step releases the page for good
            if (accumulatorRef.current >= SCROLL_THRESHOLD) {
                accumulatorRef.current = 0;
                cooldownUntilRef.current = performance.now() + COOLDOWN_MS;

                if (visibleRef.current >= total) {
                    phaseRef.current = 'done';
                } else {
                    setVisible(visibleRef.current + 1);
                }
            }
            // Scrolling up: lines never disappear, it just lets you leave upwards
            else if (accumulatorRef.current <= -SCROLL_THRESHOLD) {
                accumulatorRef.current = 0;
                phaseRef.current = 'idle';
            }
        }

        // Safety net: scrollbar drag, keyboard, touch, inertia...
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
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('scroll', handleScroll);
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