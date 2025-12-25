import React, { useState } from 'react';
import { Collaborator, CollaboratorRole } from '../types';
import { CloseIcon } from './icons/MiscIcons';

interface AddCollaboratorModalProps {
  onClose: () => void;
  onAdd: (collaborator: Omit<Collaborator, 'id' | 'lastActive'>) => void;
}

export const AddCollaboratorModal: React.FC<AddCollaboratorModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<CollaboratorRole>(CollaboratorRole.Bioinformatician);
  const [institution, setInstitution] = useState<'Hospital' | 'Lab' | 'Pharmacy' | 'Platform'>('Platform');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    onAdd({ name, role, institution });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Invite New Collaborator</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="collaborator-name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              id="collaborator-name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g., Dr. Ada Lovelace" 
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="collaborator-role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="collaborator-role"
              value={role}
              onChange={(e) => setRole(e.target.value as CollaboratorRole)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(CollaboratorRole).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="collaborator-institution" className="block text-sm font-medium text-gray-700">Institution</label>
            <select
              id="collaborator-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value as any)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Platform</option>
              <option>Hospital</option>
              <option>Lab</option>
              <option>Pharmacy</option>
            </select>
          </div>


          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                  Cancel
              </button>
              <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Send Invite
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};