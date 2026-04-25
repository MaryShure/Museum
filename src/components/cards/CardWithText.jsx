import React from 'react';
import './cards.css';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';

const CardWithText = ({ 
  title, 
  description, 
  buttonType,
  buttonText,
  linkUrl,
  width,
  maxWidth,
  minHeight,
  height,
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

  const style = {
    width: width,
    maxWidth: maxWidth,
    minHeight: minHeight,
    height: height,
  };

  return (
    <div className="card-with-text" style={style}>
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