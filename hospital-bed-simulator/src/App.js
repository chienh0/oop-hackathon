import React, { useState } from 'react';
import './HospitalSimulator.css';
import Anthropic from '@anthropic-ai/sdk';
import Wing from './Wing';
import SetupMode from './SetupMode';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  baseURL: 'http://localhost:3000/anthropic-api',
});

function App() {
  const [setupMode, setSetupMode] = useState(true);
  const [wings, setWings] = useState({
    ICU: { beds: 5, nurses: 5, occupiedBeds: 0, activeNurses: 0, ratio: 1 },
    Cardiology: { beds: 12, nurses: 4, occupiedBeds: 0, activeNurses: 0, ratio: 3 },
    Pulmonology: { beds: 12, nurses: 3, occupiedBeds: 0, activeNurses: 0, ratio: 4 },
    Nephrology: { beds: 12, nurses: 3, occupiedBeds: 0, activeNurses: 0, ratio: 4 },
    EmergencyDepartment: { beds: 12, nurses: 4, occupiedBeds: 0, activeNurses: 0, ratio: 3 },
    GeneralMedicine: { beds: 12, nurses: 3, occupiedBeds: 0, activeNurses: 0, ratio: 4 }
  });
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateWing = (wingName, field, value) => {
    setWings(prevWings => ({
      ...prevWings,
      [wingName]: {
        ...prevWings[wingName],
        [field]: value
      }
    }));
  };

  const toggleSetupMode = () => {
    setSetupMode(!setupMode);
  };

  const assignPatient = (wingName, count = 1) => {
    setWings(prevWings => {
      const wing = prevWings[wingName];
      const availableBeds = wing.beds - wing.occupiedBeds;
      const availableNurses = Math.floor((wing.nurses * wing.ratio) - wing.occupiedBeds);
      const assignablePatients = Math.min(count, availableBeds, availableNurses);

      if (assignablePatients <= 0) {
        console.log(`No available capacity in ${wingName}`);
        return prevWings;
      }

      return {
        ...prevWings,
        [wingName]: {
          ...wing,
          occupiedBeds: wing.occupiedBeds + assignablePatients,
          activeNurses: Math.ceil((wing.occupiedBeds + assignablePatients) / wing.ratio)
        }
      };
    });
  };

  const dischargePatient = (wingName) => {
    setWings(prevWings => {
      const wing = prevWings[wingName];
      if (wing.occupiedBeds <= 0) {
        alert(`No patients to discharge in ${wingName}`);
        return prevWings;
      }
      return {
        ...prevWings,
        [wingName]: {
          ...wing,
          occupiedBeds: wing.occupiedBeds - 1,
          activeNurses: Math.ceil((wing.occupiedBeds - 1) / wing.ratio)
        }
      };
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
      const wingStatus = Object.entries(wings)
        .map(([wingName, wingData]) => `${wingName}: ${wingData.beds - wingData.occupiedBeds}/${wingData.beds} beds available, ${wingData.nurses - wingData.activeNurses}/${wingData.nurses} nurses available`)
        .join(', ');

      const messages = [
        { role: "user", content: `
          Hospital status: ${wingStatus}. 
          User query: ${input}. 
          Provide a detailed response and suggest specific actions for all patients. Use these commands:
          - 'ASSIGN_X_PATIENTS_TO_WING_Y' to assign X patients to wing Y
          Respond with a structured plan for each group of patients, including:
          1. Summary of incoming patients
          2. Individual patient group assessments and wing assignments (use the ASSIGN command for each group)
          3. Overall plan and any additional recommendations
          Use a numbered list for clarity and ensure all patients are assigned.
        ` },
      ];

      console.log("Sending request to Anthropic API...");
      const completion = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        system: "You are an AI assistant managing a hospital bed system. Assign all patients to appropriate wings based on their conditions and available capacity. Use the ASSIGN_X_PATIENTS_TO_WING_Y command for each group of patients.",
        messages: messages,
        max_tokens: 1000,
      });
      console.log("Received response from Anthropic:", completion);

      const aiResponse = completion.content[0].text;

      // Process AI response
      const assignMatches = aiResponse.matchAll(/ASSIGN_(\d+)_PATIENTS_TO_WING_(\w+)/g);
      for (const match of assignMatches) {
        const [, count, wingName] = match;
        assignPatient(wingName, parseInt(count));
      }

      // Format the response for better readability
      const formattedResponse = aiResponse
        .replace(/ASSIGN_\d+_PATIENTS_TO_WING_\w+/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');

      return formattedResponse;
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
      {setupMode ? (
        <SetupMode wings={wings} updateWing={updateWing} />
      ) : (
        <div className="wings-container">
          {Object.entries(wings).map(([wingName, wingData]) => (
            <Wing
              key={wingName}
              name={wingName}
              beds={wingData.beds}
              occupiedBeds={wingData.occupiedBeds}
              nurses={wingData.nurses}
              activeNurses={wingData.activeNurses}
              ratio={wingData.ratio}
            />
          ))}
        </div>
      )}
      <div className="sidebar">
        <h2>Hospital Bed Simulator</h2>
        <button onClick={toggleSetupMode}>
          {setupMode ? "Start Triage" : "Return to Setup"}
        </button>
        {!setupMode && (
          <>
            <form onSubmit={handleQuery}>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query..."
                rows="4"
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Submit'}
              </button>
            </form>
            {response && <p className="response">{response}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default App;