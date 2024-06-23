import React from 'react';

const NurseManager = ({ nurses, updateNurseCount }) => (
  <div className="nurse-manager">
    <h3>Nursing Staff</h3>
    {Object.entries(nurses).map(([wingName, count]) => (
      <div key={wingName} className="nurse-count">
        <span>{wingName}: {count}</span>
        <button onClick={() => updateNurseCount(wingName, -1)}>-</button>
        <button onClick={() => updateNurseCount(wingName, 1)}>+</button>
      </div>
    ))}
  </div>
);

export default NurseManager;