import React from 'react';
import { AvailableBed, OccupiedBed } from './BedIcons';

const Wing = ({ name, beds, occupiedBeds, nurses, activeNurses, ratio }) => (
  <div className={`wing ${name}`}>
    <h3>{name}</h3>
    <p>Beds: {occupiedBeds}/{beds}</p>
    <p>Nurses: {activeNurses}/{nurses}</p>
    <p>Max Beds per Nurse: {ratio}</p>
    <div className="beds">
      {Array(beds).fill().map((_, index) => (
        <div
          key={index}
          className={`bed ${index < occupiedBeds ? 'occupied' : 'available'}`}
        >
          {index < occupiedBeds ? <OccupiedBed /> : <AvailableBed />}
        </div>
      ))}
    </div>
  </div>
);

export default Wing;