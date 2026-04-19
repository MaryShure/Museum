import React from 'react';
import './cards.css';

const CardMini = ({ 
  image, 
  title, 
  description, 
  linkUrl,
  altText = "Изображение товара" 
}) => {
  return (
    <a href={linkUrl} className="card-mini">
        {image && (
          <div className="card-mini-image">
            <img src={image} alt={altText} />
          </div>
        )}
        
        <div className="card-mini-content">
          {title && <h3 className="card-title">{title}</h3>}
          
          {description && (
            <p className="card-mini-description">{description}</p>
          )}
        
        </div>
    </a>
  );
};

export default CardMini;