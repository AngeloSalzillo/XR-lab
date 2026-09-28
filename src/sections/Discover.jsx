import './Discover.css';
import { Link } from 'react-router-dom'

export default function Discover() {


    return (

        <div id="discover-section">
            <div id="button-container">
                <p id="discover-text" className="smooch-sans-thin">
                    Discover the portfolio
                </p>

                <Link to="/gallery" id="gallery-button">
                    <p className="bytesized-regular">
                        Gallery
                    </p>
                </Link> 
            </div>
        </div>
    )
}