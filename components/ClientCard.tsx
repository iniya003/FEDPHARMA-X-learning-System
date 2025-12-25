import React from 'react';
import { Client, ClientUploadState } from '../types';
import { EthicsShieldIcon } from './icons/MiscIcons';

interface ClientCardProps {
  client: Client;
  uploadState: ClientUploadState;
  onContribute: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, uploadState, onContribute }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
      <div className={`p-5 ${client.darkColor}`}>
        <div className="flex items-center">
          <client.icon className="w-10 h-10 mr-4 text-white" />
          <h3 className="text-xl font-bold text-white">{client.name}</h3>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <p className="text-base text-gray-600 mb-6 flex-grow">{client.description}</p>
        
        {uploadState.isUploaded ? (
          <div className="text-left p-4 border-2 border-dashed border-green-300 rounded-md bg-green-50 space-y-2">
            <h4 className="text-md font-semibold text-green-800">✓ Contribution Submitted</h4>
            
            {uploadState.isEthicallyCompliant && (
              <div className="flex items-center text-xs text-green-700 font-medium bg-green-200 px-2 py-1 rounded-full">
                <EthicsShieldIcon className="w-4 h-4 mr-1.5" />
                Ethically Compliant Data
              </div>
            )}
            
            {uploadState.blockchainTxId && (
              <div className="text-xs text-gray-600 pt-1">
                <p className="font-semibold">Blockchain Audit Trail:</p>
                <p className="font-mono break-all text-gray-500">{uploadState.blockchainTxId}</p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onContribute}
            className={`w-full mt-auto flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-md font-semibold text-white ${client.darkColor} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Contribute Data/Model
          </button>
        )}
      </div>
    </div>
  );
};