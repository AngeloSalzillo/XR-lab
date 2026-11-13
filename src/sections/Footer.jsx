import mailIcon from '../../assets/mail_white.svg';
import phoneIcon from '../../assets/phone_white.svg';
import whatsappIcon from '../../assets/whatsapp-svgrepo-com.svg';
import locationIcon from '../../assets/map-pin-house_white.svg';
import linkedinIcon from '../../assets/InBug-White.png';
import githubIcon from '../../assets/GitHub_Invertocat_White.svg';
import sketchfabIcon from '../../assets/sketchfab-logo-white.svg';
import NavigationBar from'../components/NavigationBar.jsx';
import ContactForm from '../components/ContactForm.jsx';
import './Footer.css';
import '../components/FooterNavigationBar.css';

export default function Contacts() {

    return (

        <div id="footer">
            <div id="info-container">
                <div id="socials-and-text-container">
                    <p className="smooch-sans-thin footer-text"> Have a project, collaboration or idea? </p>

                    <div id="socials-container">
                        <a href="https://www.linkedin.com/in/angelo-salzillo-12186124a/">
                            <img className="social-icon" src={linkedinIcon}/>
                        </a>
                        <a href="https://github.com/AngeloSalzillo">
                            <img className="social-icon" src={githubIcon}/>
                        </a>
                        <a href="https://sketchfab.com/Angelo-Salzillo">
                            <img className="social-icon" src={sketchfabIcon}/>
                        </a>
                    </div>
                </div>

                <div id="contact-info-container">
                    <div className="contact-info">
                        <img className="contacts-icon" src={mailIcon}/>
                        <p className="smooch-sans-thin"> a.salzillo.pro@gmail.com </p>
                    </div>
                    <div className="contact-info">
                        <img className="contacts-icon" src={phoneIcon}/>
                        <p className="smooch-sans-thin"> +34 687 328 326 </p>
                    </div>
                    <div className="contact-info">
                        <img className="contacts-icon" src={whatsappIcon}/>
                        <p className="smooch-sans-thin"> +39 389 237 8918 </p>
                    </div>
                    <div className="contact-info">
                        <img className="contacts-icon" src={locationIcon}/>
                        <p className="smooch-sans-thin"> Barcelona, Spain </p>
                    </div>
                </div>
            </div>

            {/*}
            <div id="navbar-container">
                <p className="smooch-sans-thin">NAVIGATION</p>
                <div className="line"></div>
                <NavigationBar type="footer-navbar"/>
            </div>
            */}
        </div>
    )
}