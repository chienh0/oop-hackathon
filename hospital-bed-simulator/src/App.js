import React, { useState } from 'react';
import './HospitalSimulator.css';
import Anthropic from '@anthropic-ai/sdk';

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

  const toggleBed = (index) => {
    const newBeds = [...beds];
    newBeds[index] = !newBeds[index];
    setBeds(newBeds);
    console.log(`Bed ${index + 1} is now ${newBeds[index] ? 'occupied' : 'available'}`);
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

      const messages = [
        { role: "user", content: `The current bed status is: ${bedStatus}. User query: ${input}. Based on the bed status and the user's query, provide a response and suggest any actions if necessary. If the query involves changing bed status, include the command 'TOGGLE_BED_X' where X is the bed number.` },
      ];

      console.log("Sending request to Anthropic API...");
      const completion = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",  // Updated to Claude 3.5 Sonnet model
        system: "You are an AI assistant managing a hospital bed system.",
        messages: messages,
        max_tokens: 1000,
      });
      console.log("Received response from Anthropic:", completion);

      const aiResponse = completion.content[0].text;

      // Check if the AI suggested toggling a bed
      const toggleMatch = aiResponse.match(/TOGGLE_BED_(\d+)/);
      if (toggleMatch) {
        const bedNumber = parseInt(toggleMatch[1]) - 1;
        if (bedNumber >= 0 && bedNumber < beds.length) {
          toggleBed(bedNumber);
        }
      }

      return aiResponse.replace(/TOGGLE_BED_\d+/g, '').trim();
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </form>
        {response && <p className="response">{response}</p>}
      </div>
    </div>
  );
}

export default App;