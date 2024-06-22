import React from 'react';

const NurseManager = ({ nurses, updateNurseCount }) => {
  return (
    <div className="nurse-manager">
      <h3>Nursing Staff</h3>
      {Object.entries(nurses).map(([type, count]) => (
        <div key={type} className="nurse-type">
          <span>{type}: {count}</span>
          <button onClick={() => updateNurseCount(type, -1)}>-</button>
          <button onClick={() => updateNurseCount(type, 1)}>+</button>
        </div>
      ))}
    </div>
  );
};

export default NurseManager;