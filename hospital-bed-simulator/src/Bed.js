import React from 'react';

const Bed = ({ isOccupied, wingName, bedNumber, onClick }) => (
  <div
    className={`bed ${isOccupied ? 'occupied' : 'available'}`}
    onClick={onClick}
  >
    {wingName.charAt(0)}{bedNumber}
  </div>
);

export default Bed;