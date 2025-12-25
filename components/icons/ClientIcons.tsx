
import React from 'react';

export const HospitalIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h-6" />
  </svg>
);


export const LabIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 003.86.517l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l-.477-2.387zM12 12a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4.5l-1.5 1.5M17 4.5l1.5 1.5M4.5 7l1.5-1.5M20.5 7l-1.5-1.5" />
  </svg>
);

export const PharmacyIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l-3-3m0 0l-3-3m3 3l3-3m-3 3v-6m3 6v-6m0-3a9 9 0 11-9 9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 11h6m-3-3v6" />
  </svg>
);
