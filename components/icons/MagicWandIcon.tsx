
import React from 'react';

export const MagicWandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M15 4V2" />
    <path d="M15 10V8" />
    <path d="M10 4.5 12.5 2" />
    <path d="M5 4.5 7.5 2" />
    <path d="M15 22v-1.172a2 2 0 0 0-.586-1.414L5 9.828V5a2 2 0 0 1 2-2h3" />
    <path d="M21 10.5 18.5 8" />
    <path d="M21 15.5 18.5 13" />
    <path d="M21 20h-2.9" />
  </svg>
);
