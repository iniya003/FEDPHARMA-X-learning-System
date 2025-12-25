import React from 'react';
import { PillIcon, BrainIcon } from './icons/MiscIcons';

// FIX: Replaced inline type with a named interface to resolve error about missing `children` prop.
interface InfoPanelProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: React.ReactNode;
}

const InfoPanel = ({ title, icon: Icon, children }: InfoPanelProps) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-full flex flex-col">
        <div className="flex items-center mb-4">
            <Icon className="w-7 h-7 mr-3 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        {children}
    </div>
);

const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full"></div>
        </div>
    </div>
);

export const AdmetPredictor: React.FC<{ admetData: string | null, isLoading: boolean }> = ({ admetData, isLoading }) => {
    const formatResponse = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('* **') || line.startsWith('**')) {
                    return <p key={index} className="font-bold text-gray-700 mt-2">{line.replace(/\*/g, '')}</p>;
                }
                if (line.startsWith('*')) {
                     return <p key={index} className="text-sm text-gray-600 ml-4">{line.replace(/\*/g, '')}</p>;
                }
                return <p key={index} className="text-sm text-gray-600">{line}</p>;
            });
    };

    return (
        <InfoPanel title="Toxicity & ADMET Predictor" icon={PillIcon}>
            <p className="text-sm text-gray-600 mb-4">
                AI-generated prediction of the compound's properties, including Absorption, Distribution, Metabolism, Excretion, and Toxicity.
            </p>
            <div className="flex-grow bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-gray-700 overflow-y-auto">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="prose prose-sm max-w-none">
                        {admetData ? formatResponse(admetData) : 'No data available.'}
                    </div>
                )}
            </div>
        </InfoPanel>
    );
};
