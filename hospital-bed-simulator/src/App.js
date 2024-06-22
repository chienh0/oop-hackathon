import React, { useState } from 'react';
import './HospitalSimulator.css';
import Anthropic from '@anthropic-ai/sdk';
import NurseManager from './NurseManager';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  baseURL: 'http://localhost:3000/anthropic-api',
});

function App() {
  const [beds, setBeds] = useState(Array(20).fill(false));
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nurses, setNurses] = useState({
    ICU: 5,
    orthopedic: 4,
    pediatric: 3,
    medicalSurgical: 6,
    ER: 5
  });
  const [nurseAssignments, setNurseAssignments] = useState(Array(20).fill(null));

  const updateNurseCount = (nurseType, change) => {
    setNurses(prevNurses => ({
      ...prevNurses,
      [nurseType]: Math.max(0, prevNurses[nurseType] + change)
    }));
  };

  const toggleBed = (indexOrIndices) => {
    setBeds(prevBeds => {
      const newBeds = [...prevBeds];
      if (Array.isArray(indexOrIndices)) {
        // Handle multiple beds
        indexOrIndices.forEach(index => {
          newBeds[index] = !newBeds[index];
        });
      } else {
        // Handle single bed
        newBeds[indexOrIndices] = !newBeds[indexOrIndices];
      }
      return newBeds;
    });
  };

  const assignNurse = (bedIndex, nurseType) => {
    setNurseAssignments(prev => {
      const newAssignments = [...prev];
      newAssignments[bedIndex] = nurseType;
      return newAssignments;
    });
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await processQuery(query);
      setResponse(result);
    } catch (error) {
      console.error('Error processing query:', error);
      setResponse("Sorry, there was an error processing your query.");
    }

    setIsLoading(false);
    setQuery('');
  };

  const processQuery = async (input) => {
    try {
      const bedStatus = beds.map((isOccupied, index) =>
        `Bed ${index + 1}: ${isOccupied ? 'Occupied' : 'Available'}`
      ).join(', ');

      const nurseStatus = Object.entries(nurses)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');

      const nurseAssignmentStatus = nurseAssignments.map((nurse, index) =>
        `Bed ${index + 1}: ${nurse || 'Unassigned'}`
      ).join(', ');

      const messages = [
        { role: "user", content: `The current bed status is: ${bedStatus}. The current nurse staffing is: ${nurseStatus}. Nurse assignments: ${nurseAssignmentStatus}. User query: ${input}. Based on the bed status, nurse staffing, nurse assignments, and the user's query, provide a response and suggest any actions if necessary. If the query involves changing bed status for multiple beds, include the command 'TOGGLE_BEDS_X,Y,Z' where X,Y,Z are bed numbers. If it involves changing nurse staffing, include the command 'UPDATE_NURSE_TYPE_Y' where TYPE is the nurse type and Y is the change in count (positive or negative). If it involves assigning nurses, include the command 'ASSIGN_NURSE_TYPE_TO_BEDS_X,Y,Z' where TYPE is the nurse type and X,Y,Z are bed numbers.` },
      ];

      console.log("Sending request to Anthropic API...");
      const completion = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        system: "You are an AI assistant managing a hospital bed system.",
        messages: messages,
        max_tokens: 1000,
      });
      console.log("Received response from Anthropic:", completion);

      const aiResponse = completion.content[0].text;

      // Check if the AI suggested toggling multiple beds
      const toggleMatch = aiResponse.match(/TOGGLE_BEDS_([\d,]+)/);
      if (toggleMatch) {
        const bedNumbers = toggleMatch[1].split(',').map(num => parseInt(num) - 1);
        toggleBed(bedNumbers);  // This now passes an array, which the updated toggleBed function can handle
      }

      // Check if the AI suggested updating nurse count
      const nurseUpdateMatch = aiResponse.match(/UPDATE_NURSE_(\w+)_(-?\d+)/);
      if (nurseUpdateMatch) {
        const nurseType = nurseUpdateMatch[1].toLowerCase();
        const change = parseInt(nurseUpdateMatch[2]);
        if (nurses.hasOwnProperty(nurseType)) {
          updateNurseCount(nurseType, change);
        }
      }

      // Check if the AI suggested assigning nurses to multiple beds
      const nurseAssignMatch = aiResponse.match(/ASSIGN_NURSE_(\w+)_TO_BEDS_([\d,]+)/);
      if (nurseAssignMatch) {
        const nurseType = nurseAssignMatch[1].toLowerCase();
        const bedNumbers = nurseAssignMatch[2].split(',').map(num => parseInt(num) - 1);
        bedNumbers.forEach(bedNumber => {
          if (bedNumber >= 0 && bedNumber < beds.length) {
            assignNurse(bedNumber, nurseType);
          }
        });
      }

      return aiResponse.replace(/TOGGLE_BEDS_[\d,]+/g, '')
                       .replace(/UPDATE_NURSE_\w+_-?\d+/g, '')
                       .replace(/ASSIGN_NURSE_\w+_TO_BEDS_[\d,]+/g, '')
                       .trim();
    } catch (error) {
      console.error("Error in processQuery:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      return "Sorry, there was an error processing your query.";
    }
  };

  return (
      <div className="hospital-simulator">
        <div className="main-content">
          <div className="floor-plan">
            {beds.map((isOccupied, index) => (
                <div
                    key={index}
                    className={`bed ${isOccupied ? 'occupied' : 'available'}`}
                    onClick={() => toggleBed(index)}  // This remains unchanged
                >
                  {index + 1}
                  {nurseAssignments[index] && (
                      <div className={`nurse-indicator ${nurseAssignments[index]}`}>
                        {nurseAssignments[index].charAt(0).toUpperCase()}
                      </div>
                  )}
                </div>
            ))}
          </div>
          <div className="sidebar">
            <h2>Hospital Bed Simulator</h2>
            <p>Available Beds: {beds.filter(bed => !bed).length}</p>
            <p>Occupied Beds: {beds.filter(bed => bed).length}</p>
            <NurseManager nurses={nurses} updateNurseCount={updateNurseCount}/>
            <form onSubmit={handleQuery}>
              <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your query..."
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Submit'}
              </button>
            </form>
            {response && <p className="response">{response}</p>}
          </div>
        </div>
      </div>
  );
}

export default App;