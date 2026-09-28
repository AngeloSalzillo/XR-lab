import './Marquee.css';

export default function ScrollText({text}){

    return(

        <div className="scroll-text-container">
            <h3 className="smooch-sans-thin scroll-text"> {text} </h3>
            <h3 className="smooch-sans-thin scroll-text"> {text} </h3>
        </div>

    )
}