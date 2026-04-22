import React from 'react';
import './cards.css';

const StartText = ({ 
  title, 
  description,
}) => {
  return (
    <div className='start-text'>
        <div>
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
        <hr></hr>
    </div>
  );
};

export default StartText;