import React from "react";

const ArrowIcon = ({ color = "currentColor", size = 24 }) => {
    return(
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.1242 9.879L18.5382 5.293L17.1242 6.707L21.3862 10.97L0.000244141 11V13L21.4462 12.97L17.1232 17.293L18.5372 18.707L23.1242 14.121C23.6849 13.5575 23.9997 12.7949 23.9997 12C23.9997 11.2051 23.6849 10.4425 23.1242 9.879Z" fill={color}/>
        </svg>
    );
}

export default ArrowIcon;