import React, { useState } from 'react';
import './HospitalSimulator.css';

function App() {
  const [beds, setBeds] = useState(Array(20).fill(false));
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const toggleBed = (index) => {
    const newBeds = [...beds];
    newBeds[index] = !newBeds[index];
    setBeds(newBeds);
    console.log(`Bed ${index + 1} is now ${newBeds[index] ? 'occupied' : 'available'}`);
  };

  const handleQuery = (e) => {
    e.preventDefault();
    const result = processQuery(query);
    setResponse(result);
    setQuery('');
  };

  const processQuery = (input) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('show available beds')) {
      const availableBeds = beds.reduce((acc, bed, index) =>
        !bed ? acc.concat(index + 1) : acc, []);
      return `Available beds: ${availableBeds.join(', ')}`;
    }

    if (lowerInput.includes('assign patient to bed')) {
      const bedNumber = parseInt(lowerInput.split('bed')[1].trim());
      if (bedNumber && bedNumber <= beds.length) {
        if (!beds[bedNumber - 1]) {
          toggleBed(bedNumber - 1);
          return `Patient assigned to bed ${bedNumber}`;
        } else {
          return `Bed ${bedNumber} is already occupied`;
        }
      }
      return 'Invalid bed number';
    }

    return "I'm sorry, I didn't understand that query.";
  };

  return (
    <div className="hospital-simulator">
      <div className="floor-plan">
        {beds.map((isOccupied, index) => (
          <div
            key={index}
            className={`bed ${isOccupied ? 'occupied' : 'available'}`}
            onClick={() => toggleBed(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className="sidebar">
        <h2>Hospital Bed Simulator</h2>
        <p>Available Beds: {beds.filter(bed => !bed).length}</p>
        <p>Occupied Beds: {beds.filter(bed => bed).length}</p>
        <form onSubmit={handleQuery}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your query..."
          />
          <button type="submit">Submit</button>
        </form>
        {response && <p className="response">{response}</p>}
      </div>
    </div>
  );
}

export default App;