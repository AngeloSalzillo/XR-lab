import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// By default the navbar scrolls so that the TOP of a section reaches the
// top of the screen. Some sections need something different. Here, the
// About section has a large padding above and below its content, so
// aligning its top would leave the text far below the top of the screen.
// Instead we center the content element on the screen.
//
//   target: id of the element to bring into view
//   block : 'start' (top of the screen) or 'center' (middle of the screen)
const SECTION_SCROLL_OPTIONS = {
    about: { target: 'about-content', block: 'center' },
};

export default function NavigationBar({type}) {

    const navigate = useNavigate();
    const location = useLocation();

    function goToSection(sectionId) {

        // Put the section we want in the URL
        navigate(`/#${sectionId}`);
    }

    useEffect(() => {

        // Only do this on the homepage
        if (location.pathname !== '/') {
            return;
        }

        // Get the section from the URL
        const sectionId = location.hash.substring(1);

        if (!sectionId) {
            return;
        }

        const options = SECTION_SCROLL_OPTIONS[sectionId] ?? {
            target: sectionId,
            block: 'start',
        };

        // Wait until the homepage has rendered
        requestAnimationFrame(() => {

            document.getElementById(options.target)?.scrollIntoView({
                behavior: 'smooth',
                block: options.block,
            });

        });

    }, [location]);

    return (
        <nav className={type}>

            <button onClick={() => goToSection('home')}>
                Home
            </button>

            <button onClick={() => goToSection('about')}>
                About
            </button>

            <Link to="/gallery">
                Gallery
            </Link>

            <button onClick={() => goToSection('footer')}>
                Contacts
            </button>

        </nav>
    );
}