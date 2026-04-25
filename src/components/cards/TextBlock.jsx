import React from "react";
import "./cards.css";

const TextBlock = ({ items = [], width, maxWidth, minHeight, height }) => {
  if (!items.length) return null;

  const style = {
    width: width,
    maxWidth: maxWidth,
    minHeight: minHeight,
    height: height,
  };

  return (
    <div className="text-block-group" style={style}>
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
