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
  // State for managing setup mode toggle
  const [setupMode, setSetupMode] = useState(true);

  // State for managing hospital wings
  const [wings, setWings] = useState({
    ICU: { beds: 5, nurses: 5, occupiedBeds: 0, activeNurses: 0, ratio: 1 },
    Cardiology: { beds: 12, nurses: 4, occupiedBeds: 0, activeNurses: 0, ratio: 3 },
    Pulmonology: { beds: 12, nurses: 3, occupiedBeds: 0, activeNurses: 0, ratio: 4 },
    Nephrology: { beds: 12, nurses: 3, occupiedBeds: 0, activeNurses: 0, ratio: 4 },
    EmergencyDepartment: { beds: 12, nurses: 4, occupiedBeds: 0, activeNurses: 0, ratio: 3 },
    GeneralMedicine: { beds: 12, nurses: 3, occupiedBeds: 0, activeNurses: 0, ratio: 4 }
  });

  // State for managing user query and AI response
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to update a specific field in a wing
  const updateWing = (wingName, field, value) => {
    setWings(prevWings => ({
      ...prevWings,
      [wingName]: {
        ...prevWings[wingName],
        [field]: value
      }
    }));
  };

  // Function to toggle between setup mode and simulation mode
  const toggleSetupMode = () => {
    setSetupMode(!setupMode);
  };

  // Function to assign patients to a specific wing
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

  // Function to discharge a patient from a specific wing
  const dischargePatient = (wingName) => {
    setWings(prevWings => {
      const wing = prevWings[wingName];
      // Check if there are patients to discharge
      if (wing.occupiedBeds <= 0) {
        alert(`No patients to discharge in ${wingName}`);
        return prevWings;
      }
      // Update wing data after discharging a patient
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

  // Function to toggle the occupancy status of a bed
  const toggleBed = (wingName, bedIndex) => {
    setWings(prevWings => {
      const wing = prevWings[wingName];
      // Calculate new occupied beds count
      const newOccupiedBeds = wing.occupiedBeds + (bedIndex < wing.occupiedBeds ? -1 : 1);
      // Calculate new active nurses count based on the updated bed occupancy
      const newActiveNurses = Math.ceil(newOccupiedBeds / wing.ratio);
      // Update wing data with new bed and nurse counts
      return {
        ...prevWings,
        [wingName]: {
          ...wing,
          occupiedBeds: newOccupiedBeds,
          activeNurses: newActiveNurses
        }
      };
    });
  };

  // Function to handle user query submission
  const handleQuery = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Process the query and get the result
      const result = await processQuery(query);
      setResponse(result);
    } catch (error) {
      console.error('Error processing query:', error);
      setResponse("Sorry, there was an error processing your query.");
    }
    // Reset loading state and clear query input
    setIsLoading(false);
    setQuery('');
  };

  // Function to process user query and interact with AI assistant
  const processQuery = async (input) => {
    try {
      // Generate current wing status 
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

      // Send request to Anthropic API
      console.log("Sending request to Anthropic API...");
      const completion = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        // Set the AI system role and instructions
        system: "You are an AI assistant managing a hospital bed system. Assign all patients to appropriate wings based on their conditions and available capacity. Use the ASSIGN_X_PATIENTS_TO_WING_Y command for each group of patients.",
        messages: messages,
        max_tokens: 1000,
      });
      console.log("Received response from Anthropic:", completion);

      // Extract the text content from the AI response
      const aiResponse = completion.content[0].text;

      // Process AI response to assign patients to wings
      const assignMatches = aiResponse.matchAll(/ASSIGN_(\d+)_PATIENTS_TO_WING_(\w+)/g);
      for (const match of assignMatches) {
        const [, count, wingName] = match;
        // Call the assignPatient function for each match found
        assignPatient(wingName, parseInt(count));
      }

      // Format the response for better readability
      const formattedResponse = aiResponse
        .replace(/ASSIGN_\d+_PATIENTS_TO_WING_\w+/g, '') // Remove assignment commands
        .split('\n') // Split into lines
        .map(line => line.trim()) // Trim whitespace
        .filter(line => line.length > 0) // Remove empty lines
        .join('\n'); // Join back into a single string

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
              onToggleBed={(bedIndex) => toggleBed(wingName, bedIndex)}
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