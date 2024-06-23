import React from 'react';
import Bed from './Bed';
import NurseIcon from './NurseIcon';

const Wing = ({ name, beds, occupiedBeds, nurses, activeNurses, ratio, onToggleBed, patients }) => {
  const requiredNurses = Math.ceil(occupiedBeds / ratio);
  const availableBeds = Math.min(beds, nurses * ratio);

  return (
    <div className={`wing ${name}`}>
      <div className="wing-info">
        <h3>{name}</h3>
        <p>Beds: {occupiedBeds}/{beds}</p>
        <p>Nurses: {activeNurses}/{nurses}</p>
        <p>Max Beds per Nurse: {ratio}</p>
      </div>
      <div className="nurse-icons">
        {Array(nurses).fill().map((_, index) => (
          <NurseIcon key={index} active={index < requiredNurses} />
        ))}
      </div>
      <div className="beds-wrapper">
        <div className="beds">
          {Array(beds).fill().map((_, index) => (
            <Bed
              key={index}
              isOccupied={index < occupiedBeds}
              isAvailable={index < availableBeds}
              wingName={name}
              bedNumber={index + 1}
              onClick={() => onToggleBed(index)}
              patientInfo={patients[`${name}_${index}`]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wing;