import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Header } from './components/Header';
import { ClientCard } from './components/ClientCard';
import { UploadModal } from './components/UploadModal';
import { CLIENTS, INITIAL_COLLABORATORS, SIMULATION_CONFIG } from './constants';
import { Client, ClientUploadState, Optimizer, SubmissionType, GlobalStatus, ChartDataPoint, LogEntry, Collaborator, CollaboratorRole, ChatMessage } from './types';
import { Collaborators } from './components/Collaborators';
import { GlobalMetrics } from './components/GlobalMetrics';
import { AggregationConsole } from './components/AggregationConsole';
import { LogTerminal } from './components/LogTerminal';
import { AddCollaboratorModal } from './components/AddCollaboratorModal';
import { MoleculeExplorer } from './components/MoleculeExplorer';
import { AdmetPredictor } from './components/AdmetPredictor';
import { DigitalTwinSimulator } from './components/DigitalTwinSimulator';
import { KnowledgeMiner } from './components/KnowledgeMiner';
import { CollaboratorProfileModal } from './components/CollaboratorProfileModal';
import { LoginPage } from './components/LoginPage';
import { ChatFAB } from './components/ChatFAB';
import { ChatPanel } from './components/ChatPanel';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalClient, setModalClient] = useState<Client | null>(null);

  const [clientStates, setClientStates] = useState<Record<Client['id'], ClientUploadState>>({
    hospital: { file: null, optimizer: Optimizer.FedAdam, submissionType: SubmissionType.FullModel, version: 'v1.0.0', isUploaded: false, blockchainTxId: null, isEthicallyCompliant: false },
    lab: { file: null, optimizer: Optimizer.FedAdam, submissionType: SubmissionType.FullModel, version: 'v1.0.0', isUploaded: false, blockchainTxId: null, isEthicallyCompliant: false },
    pharmacy: { file: null, optimizer: Optimizer.FedAdam, submissionType: SubmissionType.FullModel, version: 'v1.0.0', isUploaded: false, blockchainTxId: null, isEthicallyCompliant: false },
  });

  const [isReadyToTrain, setIsReadyToTrain] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isTrainingComplete, setIsTrainingComplete] = useState(false);
  const [isDifferentialPrivacyEnabled, setIsDifferentialPrivacyEnabled] = useState(false);

  const [status, setStatus] = useState<GlobalStatus>({
    accuracy: 0,
    loss: 2.3,
    round: 0,
    activeOptimizer: Optimizer.FedAdagrad,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  const [isAddCollaboratorModalOpen, setIsAddCollaboratorModalOpen] = useState(false);
  const [viewedCollaborator, setViewedCollaborator] = useState<Collaborator | null>(null);

  const [admetData, setAdmetData] = useState<string | null>(null);
  const [knowledgeData, setKnowledgeData] = useState<string | null>(null);
  const [isFetchingIntelligence, setIsFetchingIntelligence] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typingCollaborators, setTypingCollaborators] = useState<Array<ChatMessage['role']>>([]);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setLogs(prev => [...prev.slice(-100), newLog]);
  }, []);

  useEffect(() => {
    // FIX: Cast `s` to ClientUploadState to address type inference issue where `s` is 'unknown'.
    const allUploaded = Object.values(clientStates).every(s => (s as ClientUploadState).isUploaded);
    if (allUploaded && !isTraining && !isTrainingComplete) {
      setIsReadyToTrain(true);
    }
  }, [clientStates, isTraining, isTrainingComplete]);
  
  // Simulate real-time collaborator activity
  useEffect(() => {
    // Simulate a new collaborator joining after some time
    const joinTimer = setTimeout(() => {
        const newCollaborator: Collaborator = {
            id: new Date().toISOString(),
            name: 'Dr. Alex Ray',
            role: CollaboratorRole.Bioinformatician,
            institution: 'Lab',
            lastActive: 'online',
        };
        setCollaborators(prev => [...prev, newCollaborator]);
        addLog('info', `${newCollaborator.name} has joined the project.`);
    }, 15000);

    // Simulate typing indicators
    const typingTimers = new Map<ChatMessage['role'], number>();

    const typingInterval = setInterval(() => {
        setTypingCollaborators(currentTypers => {
            const potentialTypers: Array<ChatMessage['role']> = ['Hospital', 'Lab', 'Pharmacy'];
            const nonTypers = potentialTypers.filter(t => !currentTypers.includes(t));
            
            if (nonTypers.length > 0 && Math.random() < 0.3) {
                const newTyper = nonTypers[Math.floor(Math.random() * nonTypers.length)];
                
                const timerId = setTimeout(() => {
                    setTypingCollaborators(prev => prev.filter(t => t !== newTyper));
                    typingTimers.delete(newTyper);
                }, 2000 + Math.random() * 3000);
                
                typingTimers.set(newTyper, timerId as any as number);
                return [...currentTypers, newTyper];
            }
            return currentTypers;
        });
    }, 4000);

    return () => {
        clearTimeout(joinTimer);
        clearInterval(typingInterval);
        typingTimers.forEach(timerId => clearTimeout(timerId));
    };
}, [addLog]);


  const fetchBiomedicalIntelligence = useCallback(async () => {
    setIsFetchingIntelligence(true);
    addLog('info', 'Global model complete. Fetching biomedical intelligence...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const admetPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "You are a biomedical AI assistant. For a novel drug compound conceptually similar to Aspirin (acetylsalicylic acid), generate a mock ADMET (Absorption, Distribution, Metabolism, Excretion, Toxicity) profile. Present the information in a structured format with clear headings. Include plausible but fictional values for key metrics like: Oral Bioavailability (%), Plasma Protein Binding (%), BBB Permeability (High/Low), and LD50 (mg/kg)."
      });
      
      const knowledgePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "You are a biomedical research AI. For a novel drug compound, let's call it 'FedPharm-24', which is a fictional NSAID similar to Ibuprofen, act as a Literature Knowledge Miner. Provide a brief summary containing the following sections: '### Similar Compounds' (list 3 real, related compounds), '### Potential Citations' (list 2 mock PubMed citation IDs in the format PMID: XXXXXXXX), and '### FDA Approval Status' (provide a plausible but fictional status like 'Phase II Clinical Trials'). Use markdown for headers."
      });

      const [admetResponse, knowledgeResponse] = await Promise.all([admetPromise, knowledgePromise]);

      setAdmetData(admetResponse.text);
      setKnowledgeData(knowledgeResponse.text);
      addLog('success', 'Biomedical intelligence suite successfully loaded.');

    } catch (error) {
      console.error("Error fetching biomedical intelligence:", error);
      addLog('error', 'Failed to fetch biomedical intelligence.');
      setAdmetData("Could not load ADMET data.");
      setKnowledgeData("Could not load knowledge data.");
    } finally {
      setIsFetchingIntelligence(false);
    }
  }, [addLog]);


  useEffect(() => {
    if (isTrainingComplete && !admetData && !knowledgeData) {
        fetchBiomedicalIntelligence();
    }
  }, [isTrainingComplete, admetData, knowledgeData, fetchBiomedicalIntelligence]);


  const handleUpload = (clientId: Client['id'], state: Omit<ClientUploadState, 'isUploaded' | 'blockchainTxId' | 'isEthicallyCompliant'>) => {
    const mockTxId = `0x${[...Array(12)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}...#${Math.floor(Math.random() * 100000) + 200000}`;
    setClientStates(prev => ({
      ...prev,
      [clientId]: {
        ...state,
        isUploaded: true,
        blockchainTxId: mockTxId,
        isEthicallyCompliant: true,
      }
    }));
    setModalClient(null);

    const client = CLIENTS.find(c => c.id === clientId);
    if (client && state.file) {
      const systemMessage: ChatMessage = {
        role: 'System',
        message: `${client.name} has shared their model "${state.file.name}" (version ${state.version}) for aggregation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, systemMessage]);
    }
  };
  
  const startTraining = useCallback(() => {
    setIsReadyToTrain(false);
    setIsTraining(true);
    addLog('info', 'Federated training process initiated.');
    if (isDifferentialPrivacyEnabled) {
      addLog('warn', 'Differential Privacy (ε=0.1) enabled. Applying noise to gradient updates.');
    }
    
    setStatus({ accuracy: 35, loss: 2.3, round: 0, activeOptimizer: Optimizer.FedAdagrad });
    setChartData([]);
    
    const interval = setInterval(() => {
      setStatus(prevStatus => {
        const currentRound = prevStatus.round + 1;
        
        if (currentRound > SIMULATION_CONFIG.TOTAL_ROUNDS) {
          clearInterval(interval);
          setIsTraining(false);
          setIsTrainingComplete(true);
          addLog('success', `Federated training complete! Final accuracy: ${prevStatus.accuracy.toFixed(2)}%`);
          return prevStatus;
        }

        const activeOptimizer = currentRound >= SIMULATION_CONFIG.SWITCH_ROUND ? Optimizer.FedAdam : Optimizer.FedAdagrad;
        const privacyNoiseEffect = isDifferentialPrivacyEnabled ? 0.75 : 1;
        const accuracyGain = (activeOptimizer === Optimizer.FedAdagrad ? Math.random() * 2.5 + 1 : Math.random() * 3 + 1.5) * privacyNoiseEffect;
        const lossDrop = (Math.random() * 0.1 + 0.05) * (prevStatus.loss > 0.5 ? 1 : 0.3);
        
        const newAccuracy = Math.min(98, prevStatus.accuracy + accuracyGain);
        const newLoss = Math.max(0.1, prevStatus.loss - lossDrop);

        const accuracyImprovement = newAccuracy - (prevStatus.round === 0 ? 35 : prevStatus.accuracy);
        addLog('info', `Round ${currentRound}: Aggregating models. Global model accuracy improving by ${accuracyImprovement.toFixed(2)}%`);


        if (currentRound === SIMULATION_CONFIG.SWITCH_ROUND) {
            addLog('warn', `Switching optimizer to ${Optimizer.FedAdam} for improved convergence.`);
        }

        setChartData(prevData => [...prevData, { round: currentRound, accuracy: newAccuracy, loss: newLoss, optimizer: activeOptimizer }]);
        
        return {
          accuracy: newAccuracy,
          loss: newLoss,
          round: currentRound,
          activeOptimizer,
        };
      });
    }, 1800);
  }, [addLog, isDifferentialPrivacyEnabled]);

  const handleAddCollaborator = (collaborator: Omit<Collaborator, 'id' | 'lastActive'>) => {
    const newCollaborator: Collaborator = {
      ...collaborator,
      id: new Date().toISOString(),
      lastActive: 'online',
    };
    setCollaborators(prev => [...prev, newCollaborator]);
    setIsAddCollaboratorModalOpen(false);
  };

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== id));
  };
  
  const handleSendMessage = (role: ChatMessage['role'], message: string) => {
    if (!message.trim()) return;
    const newMessage: ChatMessage = {
      role,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const showDashboard = isTraining || isTrainingComplete;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header collaborators={collaborators} />
        <main className="mt-12">
          <Collaborators 
            collaborators={collaborators}
            onAdd={() => setIsAddCollaboratorModalOpen(true)}
            onRemove={handleRemoveCollaborator}
            onView={setViewedCollaborator}
          />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {CLIENTS.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                uploadState={clientStates[client.id]}
                onContribute={() => setModalClient(client)}
              />
            ))}
          </div>

          {isReadyToTrain && (
             <div className="mt-12 text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-reveal">
                <h2 className="text-2xl font-bold text-gray-800">All Contributions Received!</h2>
                <p className="mt-2 text-gray-600">The global model is ready for federated training.</p>
                
                <div className="my-6 flex items-center justify-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input 
                        type="checkbox" 
                        id="privacy-toggle" 
                        checked={isDifferentialPrivacyEnabled} 
                        onChange={e => setIsDifferentialPrivacyEnabled(e.target.checked)} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="privacy-toggle" className="text-sm text-gray-700 font-medium cursor-pointer">
                        Apply ε = 0.1 privacy noise to gradient updates. (Differential Privacy)
                    </label>
                </div>

                <button 
                  onClick={startTraining}
                  className="mt-4 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
                >
                  Start Federated Training
                </button>
            </div>
          )}

          {showDashboard && (
            <div className="mt-12 animate-reveal">
              <GlobalMetrics status={status} />
              <AggregationConsole status={status} chartData={chartData} />
              <div className="mt-8">
                  <LogTerminal logs={logs} />
              </div>
            </div>
          )}
          
          {isTrainingComplete && (
            <div className="mt-12 animate-reveal">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Biomedical Intelligence Suite</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MoleculeExplorer />
                <AdmetPredictor admetData={admetData} isLoading={isFetchingIntelligence} />
                <DigitalTwinSimulator />
                <KnowledgeMiner knowledgeData={knowledgeData} isLoading={isFetchingIntelligence} />
              </div>
            </div>
          )}

        </main>
        {modalClient && (
          <UploadModal
            client={modalClient}
            onClose={() => setModalClient(null)}
            onUpload={(state) => handleUpload(modalClient.id, state)}
            initialState={clientStates[modalClient.id]}
          />
        )}
        {isAddCollaboratorModalOpen && (
          <AddCollaboratorModal
            onClose={() => setIsAddCollaboratorModalOpen(false)}
            onAdd={handleAddCollaborator}
          />
        )}
        {viewedCollaborator && (
            <CollaboratorProfileModal
                collaborator={viewedCollaborator}
                onClose={() => setViewedCollaborator(null)}
            />
        )}
      </div>
       <ChatFAB onClick={() => setIsChatOpen(true)} />
       <ChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        typingCollaborators={typingCollaborators}
       />
    </div>
  );
};

export default App;
