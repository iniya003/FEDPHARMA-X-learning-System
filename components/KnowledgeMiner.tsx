import React from 'react';
import { BookOpenIcon } from './icons/MiscIcons';

// FIX: Replaced inline type with a named interface to resolve error about missing `children` prop.
interface InfoPanelProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: React.ReactNode;
}

const InfoPanel = ({ title, icon: Icon, children }: InfoPanelProps) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-full flex flex-col">
        <div className="flex items-center mb-4">
            <Icon className="w-7 h-7 mr-3 text-green-600" />
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

export const KnowledgeMiner: React.FC<{ knowledgeData: string | null, isLoading: boolean }> = ({ knowledgeData, isLoading }) => {
    const formatResponse = (text: string) => {
        const sections: { [key: string]: string[] } = {};
        let currentSection: string | null = null;

        text.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('### ')) {
                currentSection = trimmedLine.substring(4).trim();
                sections[currentSection] = [];
            } else if (currentSection && trimmedLine.length > 0) {
                sections[currentSection].push(trimmedLine.replace(/^- /, ''));
            }
        });

        return Object.entries(sections).map(([title, items]) => (
            <div key={title} className="mb-3">
                <h4 className="font-semibold text-gray-700">{title}</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mt-1">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        ));
    };


    return (
        <InfoPanel title="Literature Knowledge Miner" icon={BookOpenIcon}>
             <p className="text-sm text-gray-600 mb-4">
                AI-powered search for similar molecules, citations, and FDA approval status from biomedical literature.
            </p>
            <div className="flex-grow bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-gray-700 overflow-y-auto">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    knowledgeData ? formatResponse(knowledgeData) : 'No data available.'
                )}
            </div>
        </InfoPanel>
    );
};
