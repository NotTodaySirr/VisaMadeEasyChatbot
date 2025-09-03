import React from 'react';
import './CardsGrid.css';

const CardsGrid = ({ children, className = '' }) => {
  return (
    <div className={`cards-grid ${className}`}>
      {children}
    </div>
  );
};

export default CardsGrid;


