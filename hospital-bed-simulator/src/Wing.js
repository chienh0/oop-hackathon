// Wing.js
import React from 'react';

const Wing = ({ name, beds, occupiedBeds, nurses, activeNurses, ratio }) => (
  <div className="wing">
    <h3>{name}</h3>
    <p>Beds: {occupiedBeds}/{beds} (Occupied/Total)</p>
    <p>Nurses: {activeNurses}/{nurses} (Active/Total)</p>
    <p>Max Beds per Nurse: {ratio}</p>
    <div className="beds">
      {Array(beds).fill().map((_, index) => (
        <div
          key={index}
          className={`bed ${index < occupiedBeds ? 'occupied' : 'available'}`}
        >
          {index + 1}
        </div>
      ))}
    </div>
  </div>
);

export default Wing;