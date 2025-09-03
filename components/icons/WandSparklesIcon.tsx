import React from 'react';

export const WandSparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m5 3-3 3 3 3" />
    <path d="m19 21 3-3-3-3" />
    <path d="M2 6h20" />
    <path d="M2 18h20" />
    <path d="M6.34 2.89 4.5 9.12a2 2 0 0 0 1.36 2.44l8.28 2.88a2 2 0 0 0 2.44-1.36l1.84-6.24" />
    <path d="m14.26 14.26 2.88 8.28" />
  </svg>
);
