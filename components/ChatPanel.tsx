import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ChatMessage } from '../types';
import { CloseIcon, SendIcon, SpeakerOnIcon, SpeakerOffIcon, SummarizeIcon } from './icons/MiscIcons';
import { CLIENTS } from '../constants';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (role: ChatMessage['role'], message: string) => void;
  typingCollaborators: Array<ChatMessage['role']>;
}

const roleColors: Record<ChatMessage['role'], { bg: string, text: string, align: string, name: string }> = {
    'You': { bg: 'bg-blue-500', text: 'text-white', align: 'items-end', name: 'You' },
    'Hospital': { bg: CLIENTS[0].color.replace('bg-', 'bg-').replace('-100', '-500'), text: 'text-white', align: 'items-start', name: CLIENTS[0].name },
    'Lab': { bg: CLIENTS[1].color.replace('bg-', 'bg-').replace('-100', '-500'), text: 'text-white', align: 'items-start', name: CLIENTS[1].name },
    'Pharmacy': { bg: CLIENTS[2].color.replace('bg-', 'bg-').replace('-100', '-500'), text: 'text-white', align: 'items-start', name: CLIENTS[2].name },
    'System': { bg: 'bg-slate-100', text: 'text-slate-600', align: 'items-center', name: 'System' },
};

// Audio decoding utilities
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, messages, onSendMessage, typingCollaborators }) => {
    const [message, setMessage] = useState('');
    const [role, setRole] = useState<ChatMessage['role']>('You');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [isTtsEnabled, setIsTtsEnabled] = useState(false);
    const [isTtsLoading, setIsTtsLoading] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const lastPlayedMessageIndexRef = useRef<number>(-1);
    const [streamingSummary, setStreamingSummary] = useState<ChatMessage | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages, streamingSummary]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            const MAX_HEIGHT = 120; // Max height in pixels
            textarea.style.height = 'auto'; // Reset height to allow shrinking
            const scrollHeight = textarea.scrollHeight;

            if (scrollHeight > MAX_HEIGHT) {
                textarea.style.height = `${MAX_HEIGHT}px`;
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.height = `${scrollHeight}px`;
                textarea.style.overflowY = 'hidden';
            }
        }
    }, [message]);

    const playTts = useCallback(async (text: string) => {
        if (!audioContext) return;
        setIsTtsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
            }
        } catch (error) {
            console.error("TTS Error:", error);
        } finally {
            setIsTtsLoading(false);
        }
    }, [audioContext]);

    useEffect(() => {
        if (isTtsEnabled && audioContext && messages.length > lastPlayedMessageIndexRef.current + 1) {
            const lastMessageIndex = messages.length - 1;
            const lastMessage = messages[lastMessageIndex];
            
            if (lastMessage.role !== 'You' && lastMessage.role !== 'System') {
                const textToSpeak = `${roleColors[lastMessage.role].name} said: ${lastMessage.message}`;
                playTts(textToSpeak);
            }
            lastPlayedMessageIndexRef.current = lastMessageIndex;
        }
    }, [messages, isTtsEnabled, audioContext, playTts]);

    const handleSend = () => {
        if (!message.trim()) return;
        onSendMessage(role, message);
        setMessage('');
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    const handleSummarize = async () => {
        const relevantMessages = messages.filter(msg => msg.role !== 'System');
        if (relevantMessages.length < 2) {
            onSendMessage('System', 'Not enough conversation history to generate a summary.');
            return;
        }
        
        setIsSummarizing(true);
        setStreamingSummary(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const conversationHistory = relevantMessages
                .map(msg => `${roleColors[msg.role]?.name || msg.role}: ${msg.message}`)
                .join('\n');
            
            const prompt = `You are an AI assistant for FedPharma-X, a federated drug discovery platform. Your task is to summarize the following conversation between scientific collaborators.

The summary should be concise, well-structured, and use markdown for formatting. It must highlight the following key areas:
- **Key Findings & Data Points**: Important results, measurements, or data files mentioned.
- **Decisions Made**: Any clear decisions agreed upon by the team.
- **Action Items**: Explicit tasks assigned to collaborators (use role names).
- **Open Questions**: Any unresolved questions or topics for future discussion.

If a category has no relevant information, omit it.

Conversation History:
---
${conversationHistory}
---

Summary:`;

            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro', // Upgraded model for higher accuracy
                contents: prompt,
            });

            let fullSummaryText = '✨ **Conversation Summary**\n\n';
            const initialSummaryMessage: ChatMessage = {
                role: 'System',
                message: fullSummaryText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setStreamingSummary(initialSummaryMessage);
            
            for await (const chunk of stream) {
                fullSummaryText += chunk.text;
                // Use functional update to ensure we're updating the latest state
                setStreamingSummary(prev => prev ? { ...prev, message: fullSummaryText } : null);
            }
            
            onSendMessage('System', fullSummaryText);

        } catch (error) {
            console.error("Summarization Error:", error);
            onSendMessage('System', 'Sorry, an error occurred while generating the summary.');
        } finally {
            setStreamingSummary(null); // Clear the temporary streaming message
            setIsSummarizing(false);
        }
    };

    const toggleTts = () => {
        if (!audioContext) {
            try {
                const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                setAudioContext(newAudioContext);
            } catch (error) {
                console.error("Could not create AudioContext:", error);
                return; // Don't enable if context fails
            }
        }
        // Resume context if suspended
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        setIsTtsEnabled(prev => !prev);
    };

    const animationClass = isOpen ? 'animate-[slide-in-right_0.5s_ease-out_forwards]' : 'animate-[slide-out-right_0.5s_ease-out_forwards]';

    if (!isOpen && messages.length === 0) return null;
    
    const displayedMessages = streamingSummary ? [...messages, streamingSummary] : messages;
    
    const getTypingMessage = () => {
        if (typingCollaborators.length === 0) return null;
        if (typingCollaborators.length === 1) return `${typingCollaborators[0]} is typing...`;
        if (typingCollaborators.length === 2) return `${typingCollaborators[0]} and ${typingCollaborators[1]} are typing...`;
        return 'Multiple collaborators are typing...';
    };

    const typingMessage = getTypingMessage();

    return (
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform ${animationClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800 text-white">
                <h3 className="text-lg font-bold">Collab Chat</h3>
                <div className="flex items-center gap-4">
                     <button
                        onClick={handleSummarize}
                        disabled={isSummarizing || messages.filter(m => m.role !== 'System').length < 2}
                        className="text-white opacity-70 hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Summarize conversation"
                        title="Summarize conversation"
                    >
                        {isSummarizing ? (
                             <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SummarizeIcon className="w-6 h-6" />
                        )}
                    </button>
                    <button onClick={toggleTts} className="text-white opacity-70 hover:opacity-100" aria-label="Toggle Text-to-Speech">
                        {isTtsLoading ? (
                           <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        ) : isTtsEnabled ? <SpeakerOnIcon className="w-6 h-6" /> : <SpeakerOffIcon className="w-6 h-6" />}
                    </button>
                    <button onClick={onClose} className="text-white opacity-70 hover:opacity-100">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
                <div className="space-y-4">
                    {displayedMessages.map((msg, index) => {
                        if (msg.role === 'System') {
                             const isSummary = msg.message.startsWith('✨ **Conversation Summary**');
                            if (isSummary) {
                                return (
                                    <div key={index} className="my-2 p-4 bg-slate-100 border-l-4 border-blue-500 rounded-r-lg animate-fade-in">
                                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{msg.message}</p>
                                        <p className="text-right text-xs text-slate-400 mt-2 font-mono">Generated at {msg.timestamp}</p>
                                    </div>
                                )
                            }
                            return (
                                <div key={index} className="py-2 text-center text-xs text-slate-500">
                                    <p className="whitespace-pre-wrap">
                                        <span className="font-semibold mr-1">System:</span>
                                        <span className="italic">{msg.message}</span>
                                        <span className="text-slate-400 ml-2 font-mono">[{msg.timestamp}]</span>
                                    </p>
                                </div>
                            );
                        }

                        const style = roleColors[msg.role] || roleColors['You'];
                        const isYou = msg.role === 'You';
                        return (
                             <div key={index} className={`flex flex-col ${style.align}`}>
                                <span className={`text-xs text-gray-500 ${isYou ? 'mr-2' : 'ml-2'}`}>{style.name}, {msg.timestamp}</span>
                                <div className={`px-4 py-2 rounded-lg max-w-xs ${style.bg} ${style.text}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                 {displayedMessages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                )}
            </div>

            {/* Typing Indicator */}
            <div className="h-6 px-4 pb-2 text-sm text-gray-500 italic bg-white">
                {typingMessage && (
                    <div className="flex items-center gap-1.5 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <span className="ml-1">{typingMessage}</span>
                    </div>
                )}
            </div>


            {/* Input Form */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-start gap-2">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as ChatMessage['role'])}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="You">You</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Lab">Lab</option>
                        <option value="Pharmacy">Pharmacy</option>
                    </select>
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none overflow-hidden"
                    />
                    <button
                        onClick={handleSend}
                        className="p-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
