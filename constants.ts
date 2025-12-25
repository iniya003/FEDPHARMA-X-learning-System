import { Client, Collaborator, CollaboratorRole } from './types';
import { HospitalIcon, LabIcon, PharmacyIcon } from './components/icons/ClientIcons';

export const CLIENTS: Client[] = [
  {
    id: 'hospital',
    name: 'Hospital',
    icon: HospitalIcon,
    description: 'Provide anonymized clinical trial and patient outcome data to improve drug efficacy and safety models.',
    domain: 'Oncology (EGFR/BRAF inhibitors)',
    exampleFile: 'Client1.bin',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    darkColor: 'bg-blue-600',
  },
  {
    id: 'lab',
    name: 'Research Lab',
    icon: LabIcon,
    description: 'Contribute pre-trained models and experimental data from in-silico and in-vitro studies.',
    domain: 'Antiviral / Molecular Simulation',
    exampleFile: 'Client2.bin',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    darkColor: 'bg-purple-600',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    icon: PharmacyIcon,
    description: 'Share aggregated prescription data and patient demographic information stripped of all personal identifiers.',
    domain: 'Neuropharmacology',
    exampleFile: 'Client3.bin',
    color: 'bg-green-100 border-green-300 text-green-800',
    darkColor: 'bg-green-600',
  },
];

export const SIMULATION_CONFIG = {
  TOTAL_ROUNDS: 20,
  SWITCH_ROUND: 10,
};

export const ROLE_COLORS: Record<CollaboratorRole, string> = {
    [CollaboratorRole.ClinicalResearcher]: 'bg-blue-100 text-blue-800 border-blue-200',
    [CollaboratorRole.Bioinformatician]: 'bg-purple-100 text-purple-800 border-purple-200',
    [CollaboratorRole.Pharmacologist]: 'bg-green-100 text-green-800 border-green-200',
    [CollaboratorRole.LabTechnician]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [CollaboratorRole.RegulatoryAffairs]: 'bg-red-100 text-red-800 border-red-200',
    [CollaboratorRole.MedicalDirector]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export const INITIAL_COLLABORATORS: Collaborator[] = [
    { id: '1', name: 'Dr. Evelyn Reed', role: CollaboratorRole.MedicalDirector, institution: 'Platform', lastActive: '5m ago' },
    { id: '2', name: 'Dr. Kenji Tanaka', role: CollaboratorRole.ClinicalResearcher, institution: 'Hospital', lastActive: '2h ago' },
    { id: '3', name: 'Dr. Sofia Rossi', role: CollaboratorRole.Pharmacologist, institution: 'Pharmacy', lastActive: 'yesterday' },
    { id: '4', name: 'Ben Carter', role: CollaboratorRole.Bioinformatician, institution: 'Platform', lastActive: '15m ago' },
    { id: '5', name: 'Aisha Khan', role: CollaboratorRole.RegulatoryAffairs, institution: 'Platform', lastActive: 'online' },
    { id: '6', name: 'Dr. Marcus Chen', role: CollaboratorRole.LabTechnician, institution: 'Lab', lastActive: '8h ago' },
];