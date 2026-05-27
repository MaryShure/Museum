import React from "react";

const ArrowIcon = ({ color = "currentColor", size = 24 }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 13V11L2.55621 11.031L6.87797 6.707L5.46405 5.293L0.87831 9.879C0.315928 10.4416 0 11.2045 0 12C0 12.7955 0.315928 13.5584 0.87831 14.121L5.46405 18.707L6.87797 17.293L2.61621 13.031L24 13Z"
        fill={color}
      />
    </svg>
  );
};

export default ArrowIcon;
