import React from 'react';
import { Collaborator } from '../types';

interface HeaderProps {
  collaborators: Collaborator[];
}

export const Header: React.FC<HeaderProps> = ({ collaborators }) => {
  const onlineCollaborators = collaborators.filter(c => c.lastActive === 'online');

  return (
    <header className="relative text-center pb-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          Federated Learning for Drug Discovery
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
          Securely collaborate on sensitive pharmaceutical data to accelerate the discovery of novel therapeutics — without sharing raw data.
        </p>
        
        <div className="absolute top-0 right-0 flex items-center h-full">
            <div className="flex -space-x-4 items-center">
                {onlineCollaborators.slice(0, 5).map((collaborator, index) => (
                    <div key={collaborator.id} className="group relative transition-all duration-300 ease-out" style={{ zIndex: 10 - index }}>
                        <img
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-white transition-transform duration-300 group-hover:scale-110"
                            src={`https://i.pravatar.cc/150?u=${encodeURIComponent(collaborator.name)}`}
                            alt={collaborator.name}
                        />
                        <div className="absolute bottom-0 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {collaborator.name}
                        </div>
                    </div>
                ))}
                {onlineCollaborators.length > 5 && (
                     <div className="h-12 w-12 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center text-slate-600 font-bold text-sm" style={{ zIndex: 4 }}>
                        +{onlineCollaborators.length - 5}
                    </div>
                )}
            </div>
        </div>
    </header>
  );
};
