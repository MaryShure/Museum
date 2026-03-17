import React from "react";

const FacebookIcon = ({color = "currentColor"}) => {
    return(
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_141_196)">
        <path d="M12 0C18.6273 0 23.9994 5.3923 24 12.0439C24 18.2019 19.396 23.2798 13.4541 24V15.7246H16.7002L17.374 12.0439H13.4541V10.7422C13.4542 8.79745 14.2152 8.0498 16.1826 8.0498C16.7934 8.04981 17.2852 8.0639 17.5684 8.09375V4.75781C17.0317 4.6085 15.7203 4.45902 14.96 4.45898C10.9501 4.45898 9.1016 6.35877 9.10156 10.458V12.0439H6.62695V15.7246H9.10156V23.7334C3.87484 22.4317 0 17.6922 0 12.0439C8.68559e-05 5.3923 5.37269 5.65804e-08 12 0Z" fill={color}/>
        </g>
        <defs>
        <clipPath id="clip0_141_196">
        <rect width="24" height="24" fill="white"/>
        </clipPath>
        </defs>
        </svg>
    );    
}

export default FacebookIcon;