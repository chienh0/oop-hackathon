// Bed.js
import React, { useState } from 'react';

const Bed = ({ isOccupied, wingName, bedNumber, onClick, patientInfo }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="bed-container">
      <div
        className={`bed ${isOccupied ? 'occupied' : 'available'}`}
        onClick={onClick}
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      >
        {wingName.charAt(0)}{bedNumber}
      </div>
      {isOccupied && showInfo && patientInfo && (
        <div className="patient-info">
          <p><strong>Condition:</strong> {patientInfo.condition}</p>
          <p><strong>Age:</strong> {patientInfo.age}</p>
          <p><strong>Gender:</strong> {patientInfo.gender}</p>
          <p><strong>Discharge Probability:</strong> {(patientInfo.dischargeProb * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};

export default Bed;