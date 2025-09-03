import React from 'react';

export const LandscapeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m20 21-1.47-2.94A2 2 0 0 0 16.69 17H7.31a2 2 0 0 0-1.83 1.06L4 21" />
    <path d="m16 11-2.5-4-2.5 4" />
    <path d="m14 13-1-1-1 1" />
    <circle cx="12" cy="7" r="2" />
    <path d="M4 11h4" />
    <path d="M16 11h4" />
  </svg>
);