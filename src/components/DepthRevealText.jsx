import './DepthRevealText.css';
import { useEffect, useRef, useState } from 'react';

const SCROLL_THRESHOLD = 500;
const COOLDOWN_MS = 400;

export default function DepthRevealText({ lines }) {

    const sectionRef = useRef(null);

    const phaseRef = useRef('idle');
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

        const getActivationY = () =>
            sectionRef.current.getBoundingClientRect().top
            + window.scrollY;

        const jumpTo = (y) =>
            window.scrollTo({
                top: y,
                left: 0,
                behavior: 'instant'
            });

        const lock = (y) => {
            phaseRef.current = 'locked';
            lockYRef.current = y;
            accumulatorRef.current = 0;
            cooldownUntilRef.current =
                performance.now() + COOLDOWN_MS;

            jumpTo(y);
        };

        const getDelta = (e) => {
            if (e.deltaMode === 1) return e.deltaY * 16;
            if (e.deltaMode === 2) {
                return e.deltaY * window.innerHeight;
            }
            return e.deltaY;
        };

        // If the page loads below this section, do not lock it.
        if (
            sectionRef.current &&
            window.scrollY > getActivationY() + 1
        ) {
            phaseRef.current = 'done';
            setVisible(total);
        }

        function handleWheel(event) {

            if (!sectionRef.current) return;

            const phase = phaseRef.current;

            if (phase === 'done') return;

            const delta = getDelta(event);

            // Normal scrolling until the section reaches the top.
            if (phase === 'idle') {

                if (delta <= 0) return;

                const activationY = getActivationY();
                const y = window.scrollY;

                if (
                    y <= activationY &&
                    y + delta >= activationY
                ) {
                    event.preventDefault();
                    lock(activationY);
                }

                return;
            }

            // The mouse wheel now drives the depth sequence.
            event.preventDefault();

            if (
                performance.now() <
                cooldownUntilRef.current
            ) {
                return;
            }

            if (
                Math.sign(delta) !==
                Math.sign(accumulatorRef.current)
            ) {
                accumulatorRef.current = 0;
            }

            accumulatorRef.current += delta;

            // Move deeper into the scene.
            if (
                accumulatorRef.current >= SCROLL_THRESHOLD
            ) {

                accumulatorRef.current = 0;

                cooldownUntilRef.current =
                    performance.now() + COOLDOWN_MS;

                if (visibleRef.current >= total) {
                    phaseRef.current = 'done';
                } else {
                    setVisible(visibleRef.current + 1);
                }
            }

            // Scroll upwards to leave the sequence.
            else if (
                accumulatorRef.current <=
                -SCROLL_THRESHOLD
            ) {
                accumulatorRef.current = 0;
                phaseRef.current = 'idle';
            }
        }

        // Prevent scrollbar dragging from bypassing the sequence.
        function handleScroll() {

            if (!sectionRef.current) return;

            const phase = phaseRef.current;

            if (phase === 'done') return;

            if (phase === 'locked') {

                if (
                    Math.abs(
                        window.scrollY - lockYRef.current
                    ) > 1
                ) {
                    jumpTo(lockYRef.current);
                }

                return;
            }

            const activationY = getActivationY();

            if (window.scrollY > activationY) {
                lock(activationY);
            }
        }

        window.addEventListener(
            'wheel',
            handleWheel,
            { passive: false }
        );

        window.addEventListener(
            'scroll',
            handleScroll,
            { passive: true }
        );

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('scroll', handleScroll);
        };

    }, [lines.length]);

    return (
        <section
            ref={sectionRef}
            className="depth-reveal-section"
        >
            <div className="depth-reveal-scene">

                <h2 className="depth-reveal-text smooch-sans-thin">

                    {lines.map((line, index) => (
                        <span
                            key={index}
                            className={
                                index < visibleLines
                                    ? 'visible'
                                    : ''
                            }
                        >
                            {line}
                        </span>
                    ))}

                </h2>

            </div>
        </section>
    );
}