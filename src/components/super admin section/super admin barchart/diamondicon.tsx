import React from "react";

export const DiamondIcon: React.FC<{ size?: number }> = ({ size = 100 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer semi-transparent diamond */}
    <polygon points="50,5 95,50 50,95 5,50" fill="#ff5ca2" fillOpacity="0.4" />
    {/* Inner solid diamond */}
    <polygon points="50,25 75,50 50,75 25,50" fill="#f50057" />
  </svg>
);
