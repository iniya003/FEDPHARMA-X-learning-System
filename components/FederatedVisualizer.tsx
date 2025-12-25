
import React, { useState, useEffect } from 'react';
import { GlobalStatus } from '../types';
import { CLIENTS, SIMULATION_CONFIG } from '../constants';
import { HospitalIcon, LabIcon, PharmacyIcon } from './icons/ClientIcons';
import { GlobalModelIcon } from './icons/MiscIcons';

interface FederatedVisualizerProps {
  status: GlobalStatus;
}

const clientIconMap = {
  hospital: HospitalIcon,
  lab: LabIcon,
  pharmacy: PharmacyIcon,
};

const clientPositions = {
    hospital: { top: '0%', left: '50%', transform: 'translateX(-50%)' },
    lab: { top: '90%', left: '15%', transform: 'translate(-50%, -50%)' },
    pharmacy: { top: '90%', left: '85%', transform: 'translate(-50%, -50%)' },
};

export const FederatedVisualizer: React.FC<FederatedVisualizerProps> = ({ status }) => {
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        if (status.round > 0) {
            setAnimationKey(key => key + 1);
        }
    }, [status.round]);

    const handleDownload = () => {
        const blob = new Blob(["Simulated global model data."], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `GlobalModel_Round${status.round}.bin`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
    <div className="flex flex-col justify-center items-center bg-gray-50 p-6 rounded-lg border border-gray-200 h-full min-h-[320px]">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Live Aggregation Visualizer</h3>
        <div key={animationKey} className="relative w-full h-48 my-4">
            <svg className="absolute top-0 left-0 w-full h-full" width="200" height="200" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
                <path id="path-hospital" d="M 100 20 L 100 80" stroke="none" fill="none" />
                <path id="path-lab" d="M 40 160 L 90 100" stroke="none" fill="none" />
                <path id="path-pharmacy" d="M 160 160 L 110 100" stroke="none" fill="none" />
                <line x1="100" y1="20" x2="100" y2="90" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="4 2"/>
                <line x1="40" y1="160" x2="95" y2="100" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 2"/>
                <line x1="160" y1="160" x2="105" y2="100" stroke="#86efac" strokeWidth="1" strokeDasharray="4 2"/>
            </svg>
            
            {/* Central Node */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center ${status.round > 0 ? 'animate-pulse' : ''}`}>
                 <GlobalModelIcon className="w-8 h-8 text-blue-500" />
            </div>

            {/* Client Nodes & Packets */}
            {CLIENTS.map(client => {
                const Icon = clientIconMap[client.id];
                const positionStyle = clientPositions[client.id];
                const colorClass = client.darkColor.replace('bg-','ring-');
                
                return (
                    <React.Fragment key={client.id}>
                        <div className={`absolute w-12 h-12 ${client.color} rounded-full flex items-center justify-center ring-2 ${colorClass}`} style={positionStyle}>
                             <Icon className="w-6 h-6"/>
                        </div>
                        {status.round > 0 && (
                            <>
                                <div className={`absolute w-3 h-3 ${client.darkColor} rounded-full animate-packet-to-center`} style={{ offsetPath: `path('${`path-${client.id}`}')` }} />
                                <div className={`absolute w-2 h-2 ${client.color} rounded-full animate-packet-from-center`} style={{ offsetPath: `path('${`path-${client.id}`}')` }} />
                            </>
                        )}
                    </React.Fragment>
                );
            })}

        </div>
        <button
            onClick={handleDownload}
            disabled={status.round < SIMULATION_CONFIG.TOTAL_ROUNDS}
            className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
            Download Global Model
        </button>
            {status.round < SIMULATION_CONFIG.TOTAL_ROUNDS && (
            <p className="text-xs text-gray-500 mt-2">Available after round {SIMULATION_CONFIG.TOTAL_ROUNDS}</p>
            )}
    </div>
    );
};
