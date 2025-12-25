import React from 'react';
import { ChatIcon } from './icons/MiscIcons';

interface ChatFABProps {
  onClick: () => void;
}

export const ChatFAB: React.FC<ChatFABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-40"
      aria-label="Open collaboration chat"
    >
      <ChatIcon className="w-8 h-8" />
    </button>
  );
};