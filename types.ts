import React from "react";

export enum Optimizer {
  FedAdagrad = 'FedAdagrad',
  FedAdam = 'FedAdam',
}

export enum SubmissionType {
  FullModel = 'Share Full Model',
  ParametersOnly = 'Parameters Only',
}

export interface Client {
  id: 'hospital' | 'lab' | 'pharmacy';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  domain: string;
  exampleFile: string;
  color: string;
  darkColor: string;
}

export interface ClientUploadState {
  file: File | null;
  optimizer: Optimizer;
  submissionType: SubmissionType;
  version: string;
  isUploaded: boolean;
  blockchainTxId: string | null;
  isEthicallyCompliant: boolean;
}

export interface GlobalStatus {
  accuracy: number;
  loss: number;
  round: number;
  activeOptimizer: Optimizer;
}

export interface ChartDataPoint {
  round: number;
  accuracy: number;
  loss: number;
  optimizer: Optimizer;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export enum CollaboratorRole {
    ClinicalResearcher = 'Clinical Researcher',
    Bioinformatician = 'Bioinformatician',
    Pharmacologist = 'Pharmacologist',
    LabTechnician = 'Lab Technician',
    RegulatoryAffairs = 'Regulatory Affairs',
    MedicalDirector = 'Medical Director',
}

export interface Collaborator {
  id: string;
  name: string;
  role: CollaboratorRole;
  institution: 'Hospital' | 'Lab' | 'Pharmacy' | 'Platform';
  lastActive: string;
}

export interface ChatMessage {
    role: 'Hospital' | 'Lab' | 'Pharmacy' | 'You' | 'System';
    message: string;
    timestamp: string;
}