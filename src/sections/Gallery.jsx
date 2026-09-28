import './Gallery.css';
import Carousel from '../components/Carousel.jsx';

export default function Gallery() {
    
    return (

        <section id="gallery">
            <Carousel id="pointcloud-carousel">
                <div className="items-viewer">
                    <iframe
                        title="Old Apartment Entrance"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        src="https://sketchfab.com/models/fe267a9e34b14063a050fcab4d378026/embed"
                    ></iframe>
                    <div className="viewer-overlay"></div>
                </div>

                <div className="items-viewer">
                    <iframe
                        title="Old Apartment Entrance"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        src="https://sketchfab.com/models/29c05b49bfc5483ca06eebca930e5a54/embed"
                    ></iframe>
                    <div className="viewer-overlay"></div>
                </div>

                <div className="items-viewer">
                    <iframe
                        title="Old Apartment Entrance"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        src="https://sketchfab.com/models/62163d2c6da34c45b44f94cffa4cd626/embed"
                    ></iframe>
                    <div className="viewer-overlay"></div>
                </div>

                <div className="items-viewer">
                    <iframe
                        title="Old Apartment Entrance"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        src="https://sketchfab.com/models/b61af2d26e7b4852a06a911274644756/embed"
                    ></iframe>
                    <div className="viewer-overlay"></div>
                </div>
            </Carousel>
        </section>
    );
}