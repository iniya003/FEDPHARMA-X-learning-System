import React from 'react';
import { Collaborator } from '../types';
import { CloseIcon, UserCircleIcon } from './icons/MiscIcons';
import { ROLE_COLORS } from '../constants';

interface CollaboratorProfileModalProps {
  collaborator: Collaborator | null;
  onClose: () => void;
}

const mockActivity = (name: string) => [
    { time: '2h ago', action: 'Uploaded model `Client1_gen2.h5` for aggregation.' },
    { time: '1d ago', action: `Commented on the results of Training Round #18.` },
    { time: '3d ago', action: 'Updated the preprocessing script for clinical trial data.' },
    { time: '1w ago', action: `Joined the '${name.split(' ')[1]} Team'` },
];


export const CollaboratorProfileModal: React.FC<CollaboratorProfileModalProps> = ({ collaborator, onClose }) => {
  if (!collaborator) return null;

  const isOnline = collaborator.lastActive === 'online';
  const roleColor = ROLE_COLORS[collaborator.role] || 'bg-gray-100 text-gray-800 border-gray-200';
  const activityFeed = mockActivity(collaborator.name);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <UserCircleIcon className="w-6 h-6 text-gray-500" />
                <h3 className="text-lg font-bold text-gray-800">Collaborator Profile</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
                <div className="relative flex-shrink-0 mb-4 sm:mb-0">
                    <img
                        className="h-24 w-24 rounded-full object-cover ring-4 ring-offset-2 ring-blue-200"
                        src={`https://i.pravatar.cc/200?u=${encodeURIComponent(collaborator.name)}`}
                        alt={collaborator.name}
                    />
                     <div className={`absolute bottom-1 right-1 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {isOnline ? 'Online' : collaborator.lastActive}
                    </div>
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-900">{collaborator.name}</h2>
                    <p className="text-md text-gray-600">{collaborator.institution}</p>
                    <div className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full border ${roleColor}`}>{collaborator.role}</div>
                </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Recent Activity</h4>
                <div className="flow-root">
                    <ul className="-mb-4">
                        {activityFeed.map((item, index) => (
                             <li key={index}>
                                <div className="relative pb-6">
                                    {index !== activityFeed.length - 1 ? (
                                        <span className="absolute top-4 left-2 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                    ) : null}
                                    <div className="relative flex items-start space-x-3">
                                        <div>
                                            <div className="h-4 w-4 bg-gray-300 rounded-full flex items-center justify-center ring-4 ring-white">
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-700">{item.action}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};