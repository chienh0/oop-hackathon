import React from 'react';
import { AvailableBed, OccupiedBed } from './BedIcons';
import Bed from './Bed';  // Make sure to import the Bed component

const Wing = ({ name, beds, occupiedBeds, nurses, activeNurses, ratio, onToggleBed, patients }) => (
  <div className={`wing ${name}`}>
    <h3>{name}</h3>
    <p>Beds: {occupiedBeds}/{beds}</p>
    <p>Nurses: {activeNurses}/{nurses}</p>
    <p>Max Beds per Nurse: {ratio}</p>
    <div className="beds">
      {Array(beds).fill().map((_, index) => (
        <Bed
          key={index}
          isOccupied={index < occupiedBeds}
          wingName={name}
          bedNumber={index + 1}
          onClick={() => onToggleBed(index)}
          patientInfo={patients[`${name}_${index}`]}
        >
          {index < occupiedBeds ? <OccupiedBed /> : <AvailableBed />}
        </Bed>
      ))}
    </div>
  </div>
);

export default Wing;