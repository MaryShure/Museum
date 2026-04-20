import React from 'react';
import './cards.css';

const CardNoHover = ({ 
  image, 
  title, 
  description, 
  linkUrl,
  altText = "Изображение товара" 
}) => {
  return (
    <a href={linkUrl} className="card-no-hover">
        {image && (
          <div className="card-image">
            <img src={image} alt={altText} />
          </div>
        )}
        
        <div className="card-content">
          {title && <h3 className="card-title">{title}</h3>}
          
          {description && (
            <p className="card-description">{description}</p>
          )}
        
        </div>
    </a>
  );
};

export default CardNoHover;