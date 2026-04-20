import React from 'react';
import './cards.css';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';

const CardWithText = ({ 
  title, 
  description, 
  buttonType,      // 'primary' | 'secondary' | undefined
  buttonText,
  linkUrl,
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
    <div className="card-with-text">
      <div className="card-with-text-content">
        {title && <h3>{title}</h3>}

        <hr />

        {description && <p>{description}</p>}

        <div className="card-with-text-actions">
          {renderButton()}
        </div>
      </div>
    </div>
  );
};

export default CardWithText;