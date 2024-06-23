// SetupMode.js
import React, { useState } from 'react';

const SetupMode = ({ wings, updateWing }) => {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="setup-mode">
      <div className="setup-header">
        <h2>Hospital Setup</h2>
        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Save Changes" : "Edit Settings"}
        </button>
      </div>
      {Object.entries(wings).map(([wingName, wingData]) => (
        <div key={wingName} className="wing-setup">
          <h3>{wingName} <span className="max-beds">Max Beds per Nurse: {wingData.ratio}</span></h3>
          {editMode ? (
            <>
              <div>
                <label>Beds: </label>
                <input 
                  type="number" 
                  value={wingData.beds} 
                  onChange={(e) => updateWing(wingName, 'beds', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label>Nurses: </label>
                <input 
                  type="number" 
                  value={wingData.nurses} 
                  onChange={(e) => updateWing(wingName, 'nurses', parseInt(e.target.value))}
                />
              </div>
            </>
          ) : (
            <>
              <p>Beds: {wingData.beds}</p>
              <p>Nurses: {wingData.nurses}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default SetupMode;