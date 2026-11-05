
import './ContactForm.css';
import { useState } from 'react';

export default function ContactForm() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    function handleChange(event) {

        const { name, value } = event.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleSubmit(event) {

        event.preventDefault();

        const recipient = 'a.salzillo.pro@gmail.com';

        const subject = encodeURIComponent(formData.subject);

        const body = encodeURIComponent(
            `Name: ${formData.name}\n` +
            `Email: ${formData.email}\n\n` +
            formData.message
        );

        window.location.href =
            `mailto:${recipient}?subject=${subject}&body=${body}`;
    }

    return (

        <section id="contact-form">

            <div className="contact-form-heading">
                <h2 className="bytesized-regular">
                    Send me a message
                </h2>

                <div className="contact-form-line"></div>

                <p className="smooch-sans-thin">
                    Have a project in mind, a question, or just want
                    to connect? Feel free to get in touch.
                </p>
            </div>

            <form onSubmit={handleSubmit}>

                <div className="contact-form-row">

                    <div className="contact-form-field">
                        <label htmlFor="contact-name">
                            Name
                        </label>

                        <input
                            id="contact-name"
                            type="text"
                            name="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="contact-form-field">
                        <label htmlFor="contact-email">
                            Email
                        </label>

                        <input
                            id="contact-email"
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                </div>

                <div className="contact-form-field">
                    <label htmlFor="contact-subject">
                        Subject
                    </label>

                    <input
                        id="contact-subject"
                        type="text"
                        name="subject"
                        placeholder="What's on your mind?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="contact-form-field">
                    <label htmlFor="contact-message">
                        Message
                    </label>

                    <textarea
                        id="contact-message"
                        name="message"
                        placeholder="Tell me about it..."
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="contact-form-submit"
                >
                    <span>Send message</span>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 -960 960 960"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                    </svg>
                </button>

            </form>

        </section>
    );
}
