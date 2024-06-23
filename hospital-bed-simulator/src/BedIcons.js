// BedIcons.js
import React from 'react';

export const AvailableBed = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <rect x="5" y="15" width="30" height="20" fill="#90EE90" stroke="#32CD32" strokeWidth="2" />
    <rect x="5" y="10" width="30" height="5" fill="#32CD32" />
    <line x1="10" y1="15" x2="10" y2="35" stroke="#32CD32" strokeWidth="2" />
    <line x1="30" y1="15" x2="30" y2="35" stroke="#32CD32" strokeWidth="2" />
  </svg>
);

export const OccupiedBed = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <rect x="5" y="15" width="30" height="20" fill="#FFA07A" stroke="#FF6347" strokeWidth="2" />
    <rect x="5" y="10" width="30" height="5" fill="#FF6347" />
    <line x1="10" y1="15" x2="10" y2="35" stroke="#FF6347" strokeWidth="2" />
    <line x1="30" y1="15" x2="30" y2="35" stroke="#FF6347" strokeWidth="2" />
    <circle cx="20" cy="25" r="5" fill="#FF6347" />
  </svg>
);