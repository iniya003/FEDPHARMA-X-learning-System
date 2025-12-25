import React, { useState } from 'react';
import { HeartPulseIcon } from './icons/MiscIcons';

// FIX: Replaced inline type with a named interface to resolve error about missing `children` prop.
interface InfoPanelProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: React.ReactNode;
}

const InfoPanel = ({ title, icon: Icon, children }: InfoPanelProps) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-full flex flex-col">
        <div className="flex items-center mb-4">
            <Icon className="w-7 h-7 mr-3 text-red-500" />
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        {children}
    </div>
);

const ResultDisplay = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="text-center">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

export const DigitalTwinSimulator: React.FC = () => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<{ efficacy: number; risk: 'Low' | 'Medium' | 'High' } | null>(null);

    const runSimulation = () => {
        setIsSimulating(true);
        setSimulationResult(null);
        setTimeout(() => {
            const efficacy = Math.floor(Math.random() * 25) + 65; // 65-90%
            const riskLevels: ['Low', 'Medium', 'High'] = ['Low', 'Medium', 'High'];
            const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
            setSimulationResult({ efficacy, risk });
            setIsSimulating(false);
        }, 2500);
    };

    const riskColor = simulationResult?.risk === 'Low' ? 'text-green-500' : simulationResult?.risk === 'Medium' ? 'text-yellow-500' : 'text-red-500';

    return (
        <InfoPanel title="Digital Twin Simulation" icon={HeartPulseIcon}>
            <p className="text-sm text-gray-600 mb-4">
                Test the drug's response on a virtual patient organ to predict efficacy and potential side effects.
            </p>
            <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="relative mb-4">
                    <HeartPulseIcon className={`w-24 h-24 text-red-200 transition-colors duration-500 ${isSimulating ? 'text-red-300' : ''}`} />
                    {isSimulating && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 border-t-2 border-red-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {simulationResult ? (
                    <div className="grid grid-cols-2 gap-6 animate-fade-in w-full max-w-xs">
                        <ResultDisplay label="Predicted Efficacy" value={`${simulationResult.efficacy}%`} color="text-green-500" />
                        <ResultDisplay label="Side Effect Risk" value={simulationResult.risk} color={riskColor} />
                    </div>
                ) : (
                     <p className="text-gray-500 text-sm h-14 flex items-center">
                        {isSimulating ? 'Simulation in progress...' : 'Ready to run simulation.'}
                    </p>
                )}
            </div>
            <div className="mt-4 flex justify-center">
                <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                    {isSimulating ? 'Running...' : simulationResult ? 'Run Again' : 'Run Simulation'}
                </button>
            </div>
        </InfoPanel>
    );
};
