import React from 'react';

const NurseIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="6" r="5" fill={active ? "#4CAF50" : "#cccccc"} />
    <rect x="5" y="11" width="10" height="8" fill={active ? "#4CAF50" : "#cccccc"} />
  </svg>
);

export default NurseIcon;