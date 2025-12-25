import React, { useEffect, useRef, useState } from 'react';
import { MoleculeIcon } from './icons/MiscIcons';

// PDB data for Caffeine
const caffeinePDB = `
MODEL        1
ATOM      1  N1  CAF A   1      -0.641  -1.396   0.000
ATOM      2  C2  CAF A   1       0.701  -1.258   0.000
ATOM      3  N3  CAF A   1       1.317  -2.452   0.000
ATOM      4  C4  CAF A   1       0.283  -3.333   0.001
ATOM      5  C5  CAF A   1      -0.906  -2.775   0.001
ATOM      6  C6  CAF A   1      -1.782  -3.565   0.001
ATOM      7  N7  CAF A   1       0.751  -4.520   0.001
ATOM      8  C8  CAF A   1      -0.208  -5.322   0.002
ATOM      9  N9  CAF A   1      -1.216  -4.639   0.002
ATOM     10  C10 CAF A   1      -1.854  -0.347   0.000
ATOM     11  C11 CAF A   1       2.766  -2.585  -0.001
ATOM     12  C12 CAF A   1      -2.203  -5.466   0.003
ATOM     13  O1  CAF A   1       1.325  -0.198   0.000
ATOM     14  O2  CAF A   1      -2.910  -3.238   0.001
ATOM     15  H1  CAF A   1      -0.001  -6.321   0.002
ATOM     16  H2  CAF A   1      -1.424   0.627  -0.428
ATOM     17  H3  CAF A   1      -2.457  -0.419   0.902
ATOM     18  H4  CAF A   1      -2.463  -0.407  -0.895
ATOM     19  H5  CAF A   1       3.267  -1.688   0.427
ATOM     20  H6  CAF A   1       3.109  -3.469  -0.518
ATOM     21  H7  CAF A   1       3.103  -2.720   0.923
ATOM     22  H8  CAF A   1      -1.791  -6.471  -0.003
ATOM     23  H9  CAF A   1      -2.887  -5.352   0.852
ATOM     24  H10 CAF A   1      -2.893  -5.337  -0.840
ENDMDL
`;

type StyleSpec = 'stick' | 'sphere' | 'cartoon';

// FIX: Replaced inline type with a named interface to resolve error about missing `children` prop.
interface InfoPanelProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: React.ReactNode;
}

const InfoPanel = ({ title, icon: Icon, children }: InfoPanelProps) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-full flex flex-col">
        <div className="flex items-center mb-4">
            <Icon className="w-7 h-7 mr-3 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        {children}
    </div>
);

export const MoleculeExplorer: React.FC = () => {
    const viewerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<StyleSpec>('stick');

    useEffect(() => {
        if (containerRef.current && !viewerRef.current) {
            const config = { backgroundColor: '#f8fafc' };
            const viewer = (window as any).$3Dmol.createViewer(containerRef.current, config);
            viewer.addModel(caffeinePDB, 'pdb');
            viewer.setStyle({}, { stick: {} });
            viewer.zoomTo();
            viewer.render();
            viewer.zoom(1.2, 1000);
            viewerRef.current = viewer;
        }
    }, []);

    useEffect(() => {
        if (viewerRef.current) {
            viewerRef.current.setStyle({}, { [style]: {} });
            viewerRef.current.render();
        }
    }, [style]);

    const handleStyleChange = (newStyle: StyleSpec) => {
        setStyle(newStyle);
    };

    return (
        <InfoPanel title="Molecule Explorer" icon={MoleculeIcon}>
             <p className="text-sm text-gray-600 mb-4">
                Inspect the 3D structure of the AI-suggested compound. (Displaying Caffeine PDB as an example).
            </p>
            <div ref={containerRef} className="w-full h-64 bg-slate-50 rounded-lg border border-slate-200 relative"></div>
            <div className="mt-4 flex justify-center space-x-2">
                {(['stick', 'sphere', 'cartoon'] as StyleSpec[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => handleStyleChange(s)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            style === s
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>
        </InfoPanel>
    );
};
