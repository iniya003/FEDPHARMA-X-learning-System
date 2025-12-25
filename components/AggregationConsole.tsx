import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { GlobalStatus, ChartDataPoint, Optimizer } from '../types';
import { SIMULATION_CONFIG } from '../constants';
import { FederatedVisualizer } from './FederatedVisualizer';

interface AggregationConsoleProps {
  status: GlobalStatus;
  chartData: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const value = data.name === 'Accuracy'
            ? `${data.value.toFixed(2)}%`
            : data.value.toFixed(4);

        return (
            <div className="bg-white p-2 border border-gray-300 rounded-md shadow-lg">
                <p className="font-bold">{`Round ${label}`}</p>
                <p style={{ color: data.color }}>{`${data.name}: ${value}`}</p>
                <p className="text-sm text-gray-500">{`Optimizer: ${data.payload.optimizer}`}</p>
            </div>
        );
    }
    return null;
};


export const AggregationConsole: React.FC<AggregationConsoleProps> = ({ status, chartData }) => {
  const progressPercentage = (status.round / SIMULATION_CONFIG.TOTAL_ROUNDS) * 100;
  
  return (
    <section className="mt-12 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Federated Aggregation Console</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Global Training Progress</span>
          <span className="text-sm font-bold text-blue-600">Round {status.round} / {SIMULATION_CONFIG.TOTAL_ROUNDS}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
            {/* Accuracy Chart */}
            <div className="h-64">
                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Global Model Accuracy</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                        <XAxis dataKey="round" />
                        <YAxis unit="%" domain={[0, 100]} stroke="#10b981"/>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} name="Accuracy" />
                        {SIMULATION_CONFIG.SWITCH_ROUND > 0 && 
                          <ReferenceLine x={SIMULATION_CONFIG.SWITCH_ROUND} stroke="orange" strokeDasharray="3 3" />
                        }
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Loss Chart */}
            <div className="h-64">
                 <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Average Training Loss</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                        <XAxis dataKey="round" />
                        <YAxis domain={[0, 'auto']} stroke="#ef4444" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} name="Loss" />
                        {SIMULATION_CONFIG.SWITCH_ROUND > 0 && 
                          <ReferenceLine x={SIMULATION_CONFIG.SWITCH_ROUND} stroke="orange" strokeDasharray="3 3" label={{ value: `Switch to ${Optimizer.FedAdam}`, position: 'insideTopRight', fill: 'orange' }} />
                        }
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
        
        <FederatedVisualizer status={status} />

      </div>
    </section>
  );
};