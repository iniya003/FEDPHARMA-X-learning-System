import React, { useState } from 'react';
import { Collaborator, CollaboratorRole } from '../types';
import { CloseIcon, SearchIcon } from './icons/MiscIcons';
import { ROLE_COLORS } from '../constants';

const AddUserIcon = (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
);

interface CollaboratorsProps {
    collaborators: Collaborator[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onView: (collaborator: Collaborator) => void;
}

// FIX: Replaced inline type with a named interface to resolve typing issue with React's `key` prop.
interface CollaboratorCardProps {
    collaborator: Collaborator;
    onRemove: (id: string) => void;
    onView: (collaborator: Collaborator) => void;
}

const CollaboratorCard: React.FC<CollaboratorCardProps> = ({ collaborator, onRemove, onView }) => {
    const isOnline = collaborator.lastActive === 'online';
    const roleColor = ROLE_COLORS[collaborator.role] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
        <div 
          className="bg-slate-50 border border-slate-200 rounded-lg p-3 group relative transition-all duration-300 hover:shadow-md hover:border-blue-400 hover:-translate-y-1 cursor-pointer"
          onClick={() => onView(collaborator)}
        >
          <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                  <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={`https://i.pravatar.cc/150?u=${encodeURIComponent(collaborator.name)}`}
                      alt={collaborator.name}
                  />
                  {isOnline && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-slate-50" title="Online"></span>}
              </div>
              <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{collaborator.name}</p>
                  <div className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${roleColor}`}>{collaborator.role}</div>
              </div>
          </div>
          <button
              onClick={(e) => { e.stopPropagation(); onRemove(collaborator.id); }}
              className="absolute top-2 right-2 bg-gray-200 text-gray-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:opacity-100"
              aria-label={`Remove ${collaborator.name}`}
          >
              <CloseIcon className="w-4 h-4" />
          </button>
           {!isOnline && (
                <p className="absolute bottom-2 right-3 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {collaborator.lastActive}
                </p>
            )}
        </div>
    );
};


export const Collaborators: React.FC<CollaboratorsProps> = ({ collaborators, onAdd, onRemove, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCollaborators = collaborators.filter(
    (collaborator) =>
      collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h3 className="text-xl font-bold text-gray-800">Project Collaborators</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your project team members.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Find collaborator..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>
             <button 
                onClick={onAdd}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
                aria-label="Invite new collaborator"
            >
                <AddUserIcon className="w-5 h-5"/>
                Invite
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCollaborators.length > 0 ? (
            filteredCollaborators.map((collaborator) => (
              <CollaboratorCard 
                key={collaborator.id} 
                collaborator={collaborator} 
                onRemove={onRemove} 
                onView={onView} 
              />
            ))
        ) : (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-gray-500 font-medium">No collaborators found.</p>
                <p className="text-sm text-gray-400 mt-1">
                    {searchTerm ? "Try adjusting your search." : "Invite a team member to get started."}
                </p>
            </div>
        )}
      </div>
    </section>
  );
};
