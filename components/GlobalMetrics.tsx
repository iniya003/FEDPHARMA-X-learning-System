import React from 'react';
import { GlobalStatus, Optimizer } from '../types';

interface GlobalMetricsProps {
  status: GlobalStatus;
}

const MetricBox: React.FC<{ label: string; value: string | number; unit?: string; color: string; }> = ({ label, value, unit, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span className={`text-3xl font-bold ${color}`}>
      {value}
      {unit && <span className="text-xl ml-1">{unit}</span>}
    </span>
  </div>
);

export const GlobalMetrics: React.FC<GlobalMetricsProps> = ({ status }) => {
  const optimizerColor = status.activeOptimizer === Optimizer.FedAdagrad ? 'text-orange-500' : 'text-indigo-500';
  
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricBox label="Global Model Accuracy" value={status.accuracy.toFixed(2)} unit="%" color="text-green-500" />
      <MetricBox label="Average Training Loss" value={status.loss.toFixed(4)} color="text-red-500" />
      <MetricBox label="Current Round" value={status.round} color="text-blue-500" />
      <MetricBox label="Active Optimizer" value={status.activeOptimizer} color={optimizerColor} />
    </div>
  );
};