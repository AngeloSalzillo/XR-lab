import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

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

        // Wait until the homepage has rendered
        requestAnimationFrame(() => {

            document.getElementById(sectionId)?.scrollIntoView({
                behavior: 'smooth'
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

            <button onClick={() => goToSection('contacts')}>
                Contacts
            </button>

        </nav>
    );
}