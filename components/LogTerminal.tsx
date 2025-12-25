
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';

interface LogTerminalProps {
  logs: LogEntry[];
}

const getLogLevelColor = (level: LogEntry['level']) => {
  switch (level) {
    case 'success': return 'text-green-400';
    case 'warn': return 'text-yellow-400';
    case 'error': return 'text-red-400';
    case 'info':
    default: return 'text-gray-400';
  }
};

export const LogTerminal: React.FC<LogTerminalProps> = ({ logs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-gray-800 text-white font-mono text-xs rounded-md p-3 h-48 overflow-y-auto" ref={terminalRef}>
      <div className="flex items-center pb-2 mb-2 border-b border-gray-600">
        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <span className="ml-auto text-gray-400">Training Logs</span>
      </div>
      {logs.length === 0 && <p className="text-gray-500">&gt; Waiting for activity...</p>}
      {logs.map((log, index) => (
        <div key={index} className="flex">
          <span className="text-gray-500 mr-2">{log.timestamp}</span>
          <span className={`${getLogLevelColor(log.level)} mr-2`}>[{log.level.toUpperCase()}]</span>
          <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
        </div>
      ))}
    </div>
  );
};
