import React from 'react';
import './cards.css';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';

const BigCard = ({ 
  image, 
  title, 
  description,
  buttonType,      // 'primary' | 'secondary' | undefined
  buttonText, 
  linkUrl,
  altText = "Изображение товара" 
}) => {
    const renderButton = () => {
        if (buttonType === 'primary') {
        return <PrimaryButton text={buttonText} linkUrl={linkUrl} />;
        }

        if (buttonType === 'secondary') {
        return <SecondaryButton text={buttonText} linkUrl={linkUrl} />;
        }

        return null;
    };

  return (
    <div className="big-card">
        {image && (
          <div className="big-card-image">
            <img src={image} alt={altText} />
          </div>
        )}
        
        <div className="big-card-content">
          {title && <h3 className="card-title">{title}</h3>}
          
          {description && (
            <p className="card-description">{description}</p>
          )}

          <div className="big-card-actions">
          {renderButton()}
          </div>
        
        </div>
    </div>
  );
};

export default BigCard;