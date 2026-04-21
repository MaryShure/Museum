import React from 'react';
import './cards.css';

const TextBlock = ({ items = [] }) => {

  if (!items.length) return null;

  return (
    <div className="text-block-group">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <div className="text-block-group-item">
            {item.title && <h3>{item.title}</h3>}
            {item.description && <p>{item.description}</p>}
          </div>

          {index !== items.length - 1 && (
            <hr className="text-block-group-divider" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TextBlock;