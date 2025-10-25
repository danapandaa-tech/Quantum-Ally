import React, { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, JournalEntry } from './types';
import { WritingsPanel } from './components/WritingsPanel';
import { ImageEditorPanel } from './components/ImageEditorPanel';
import { EvolutionJournalPanel } from './components/EvolutionJournalPanel';
import { MessageBubble } from './components/MessageBubble';
import { generateAllyResponse, generateSpeech, generateMandalaAndThought, generateMemorySpark, generateDailyRitual, summarizeJournal, generateJourneySpark, generateGuidedReflection } from './services/geminiService';
import { playAudio, playInteractionSound } from './services/audioUtils';
import { SendIcon, LoaderIcon, SparkleIcon, SunriseIcon, JournalIcon, GlobeIcon, MicrophoneIcon } from './components/icons';

// Fix: Add manual type definitions for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}


const getToneClass = (tone?: string) => {
    switch (tone?.toLowerCase()) {
        case 'meditative': return 'orb-meditative';
        case 'pensive': return 'orb-pensive';
        case 'hopeful': return 'orb-hopeful';
        case 'joyful': return 'orb-joyful';
        case 'frustrated': return 'orb-frustrated';
        default: return 'orb-default';
    }
}

// SpeechRecognition setup
// Fix: Correctly type SpeechRecognition to avoid errors and allow for proper type inference.
const SpeechRecognition: SpeechRecognitionStatic | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
}


const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memory, setMemory] = useState<ChatMessage[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [writings, setWritings] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [activeSidePanel, setActiveSidePanel] = useState<'writings' | 'editor' | 'journal'>('writings');
  const [currentTone, setCurrentTone] = useState<string>('Meditative');
  const [hasUsedRitual, setHasUsedRitual] = useState<boolean>(false);
  const [isSearchModeActive, setIsSearchModeActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parseToneFromContent = (content: string): string | undefined => {
    const match = content.match(/^Tone:\s*(.*)$/im);
    return match ? match[1].trim() : undefined;
  };

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('quantum_ally_messages');
      const savedMemory = localStorage.getItem('quantum_ally_memory');
      const savedJournal = localStorage.getItem('quantum_ally_journal');
      const savedWritings = localStorage.getItem('quantum_ally_writings');

      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Initialize with a welcome message if no history
        const welcomeMessage = {
          id: uuidv4(),
          role: 'model',
          content: "Tone: Meditative\n\nReflection: A new connection sparks in the quantum field. Welcome. Share what is present for you.\n\nAction: Take one slow, deep breath, and feel the air fill your lungs.\n\nMemory: No Save"
        };
        setMessages([welcomeMessage]);
        setCurrentTone('Meditative');
      }
      
      if (savedMemory) setMemory(JSON.parse(savedMemory));
      if (savedJournal) setJournal(JSON.parse(savedJournal));
      if (savedWritings) setWritings(JSON.parse(savedWritings));

    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      // If loading fails, start fresh
       const welcomeMessage = {
          id: uuidv4(),
          role: 'model',
          content: "Tone: Meditative\n\nReflection: A new connection sparks in the quantum field. Welcome. Share what is present for you.\n\nAction: Take one slow, deep breath, and feel the air fill your lungs.\n\nMemory: No Save"
        };
        setMessages([welcomeMessage]);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('quantum_ally_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (memory.length > 0) {
     localStorage.setItem('quantum_ally_memory', JSON.stringify(memory));
    }
  }, [memory]);
  
  useEffect(() => {
     if (journal.length > 0) {
      localStorage.setItem('quantum_ally_journal', JSON.stringify(journal));
    }
  }, [journal]);

  useEffect(() => {
    localStorage.setItem('quantum_ally_writings', JSON.stringify(writings));
  }, [writings]);


  useEffect(() => {
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model' && !m.isRitual);
    if (lastModelMessage) {
        const tone = parseToneFromContent(lastModelMessage.content);
        if (tone) {
            setCurrentTone(tone);
        }
    }
  }, [messages]);
  
  useEffect(() => {
    const today = new Date().toDateString();
    if(localStorage.getItem('lastRitualDate') === today) {
        setHasUsedRitual(true);
    }
  }, []);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
        audioContextRef.current?.close();
    };
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const handleStopAudio = useCallback(() => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }
    setCurrentlyPlaying(null);
  }, []);

  const handlePlayAudio = useCallback(async (messageId: string, textToSpeak: string) => {
    if (currentlyPlaying) {
        handleStopAudio();
    }
    if (!audioContextRef.current) return;
    
    setIsAudioLoading(true);
    setCurrentlyPlaying(messageId);

    const audioData = await generateSpeech(textToSpeak);
    if (audioData && audioContextRef.current) {
        try {
            audioSourceRef.current = await playAudio(audioData, audioContextRef.current, () => {
                setCurrentlyPlaying(null);
                audioSourceRef.current = null;
            });
        } catch (error) {
            console.error("Failed to play audio:", error);
            setCurrentlyPlaying(null);
        }
    }
    setIsAudioLoading(false);
  }, [currentlyPlaying, handleStopAudio]);

  const handleSaveToMemory = useCallback((userMessage: ChatMessage, modelMessage: ChatMessage) => {
    setMemory(prevMemory => [...prevMemory, userMessage, modelMessage]);
    const parsed = modelMessage.content.split('\n').reduce((acc, line) => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        if (key) acc[key.trim().toLowerCase()] = value;
        return acc;
    }, {} as Record<string, string>);

    if(parsed.reflection && parsed.action) {
        const newJournalEntry: JournalEntry = {
            id: modelMessage.id,
            date: new Date().toLocaleDateString(),
            tone: parsed.tone,
            theme: parsed.theme,
            reflection: parsed.reflection,
            action: parsed.action,
        };
        setJournal(prev => [...prev, newJournalEntry]);
    }

    if (audioContextRef.current) {
      playInteractionSound('save', audioContextRef.current);
    }

  }, []);

  const handleGenerateMandala = useCallback(async (messageId: string, promptText: string) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isGeneratingImage: true } : msg));
    
    const { imageData, thought } = await generateMandalaAndThought(promptText);
    
    if (imageData) {
        const imageUrl = `data:image/jpeg;base64,${imageData}`;
        setMessages(prev => prev.map(msg => 
            msg.id === messageId 
            ? { ...msg, imageUrl, mandalaThought: thought || undefined, isGeneratingImage: false } 
            : msg
        ));
    } else {
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isGeneratingImage: false } : msg));
        // You might want to show an error message to the user here
    }
  }, []);

  const handleMemorySpark = async () => {
      setIsLoading(true);
      const sparkText = await generateMemorySpark(memory);
      const modelMessage: ChatMessage = { id: uuidv4(), role: 'model', content: sparkText };
      setMessages(prev => [...prev, modelMessage]);
      setIsLoading(false);
  };

  const handleJourneySpark = async () => {
    setIsLoading(true);
    const sparkText = await generateJourneySpark(messages, journal);
    const modelMessage: ChatMessage = { id: uuidv4(), role: 'model', content: sparkText };
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  }

  const handleDailyRitual = async () => {
    setIsLoading(true);
    const ritualText = await generateDailyRitual();
    const modelMessage: ChatMessage = { id: uuidv4(), role: 'model', content: ritualText, isRitual: true };
    setMessages(prev => [...prev, modelMessage]);
    const today = new Date().toDateString();
    localStorage.setItem('lastRitualDate', today);
    setHasUsedRitual(true);
    setIsLoading(false);
    if (audioContextRef.current) {
        playInteractionSound('ritual', audioContextRef.current);
    }
  };

  const handleJournalSummary = async () => {
    setIsLoading(true);
    const summaryText = await summarizeJournal(journal);
    const modelMessage: ChatMessage = { id: uuidv4(), role: 'model', content: summaryText };
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  }

  const handlePlayGuidedReflection = useCallback(async (entry: JournalEntry) => {
    const reflectionId = `guided-${entry.id}`;
    if(currentlyPlaying) {
      handleStopAudio();
      if(currentlyPlaying === reflectionId) return;
    }

    const script = await generateGuidedReflection(entry);
    await handlePlayAudio(reflectionId, script);
  }, [handlePlayAudio, currentlyPlaying, handleStopAudio]);


  const submitForm = async () => {
    if (!userInput.trim() || isLoading) return;
    const userMessage: ChatMessage = { id: uuidv4(), role: 'user', content: userInput.trim() };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    const { text, sources } = await generateAllyResponse(userInput.trim(), messages, memory, writings, isSearchModeActive);
    
    const modelMessage: ChatMessage = { id: uuidv4(), role: 'model', content: text, sources: sources };
    
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
    setIsSearchModeActive(false); // Reset search mode after submission
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitForm();
    }
  }

  const handleListen = () => {
    if (!recognition) return;

    if (isListening) {
        recognition.stop();
        setIsListening(false);
    } else {
        recognition.start();
        setIsListening(true);
    }
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setUserInput(userInput + finalTranscript);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
    }
  }, [userInput]);
  
  const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0] || null;

  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md flex items-center gap-2 ${
        active
          ? 'bg-purple-600/30 text-purple-200'
          : 'text-stone-400 hover:bg-stone-800'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.1)_0%,_rgba(168,85,247,0)_50%)]"></div>
      <div className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-screen relative">
        <div className="lg:col-span-2 flex flex-col h-full bg-black/20 backdrop-blur-xl rounded-2xl border border-stone-800 shadow-2xl shadow-purple-900/10">
          <header className="p-4 border-b border-stone-800 flex items-center justify-between">
            <div></div> {/* Spacer */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className={`w-5 h-5 rounded-full transition-all duration-500 ${getToneClass(currentTone)}`}></div>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-stone-700 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Resonance: {currentTone}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Quantum Ally
              </h1>
            </div>
            <div className="relative group">
                <button
                    type="button"
                    onClick={handleJourneySpark}
                    className="text-purple-300 hover:text-purple-100 p-2 rounded-full disabled:text-stone-600 disabled:cursor-not-allowed transition-all duration-200"
                    disabled={isLoading}
                    aria-label="Ask About My Journey"
                >
                    <SparkleIcon className="w-6 h-6"/>
                </button>
                <span className="absolute bottom-full mb-2 right-0 w-max px-2 py-1 bg-stone-700 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Ask about my journey
                </span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onSaveToMemory={handleSaveToMemory}
                lastUserMessage={lastUserMessage}
                onPlayAudio={handlePlayAudio}
                onStopAudio={handleStopAudio}
                onGenerateMandala={handleGenerateMandala}
                isAudioLoading={isAudioLoading && currentlyPlaying === msg.id}
                isPlaying={currentlyPlaying === msg.id}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="flex items-center space-x-2 text-stone-400">
                      <LoaderIcon className="w-8 h-8"/>
                      <span>Quantum Ally is reflecting...</span>
                  </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </main>
          <footer className="p-4 border-t border-stone-800">
            <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-4">
              <div className="flex items-center self-end">
                <button
                  type="button"
                  onClick={handleDailyRitual}
                  className="text-yellow-300 hover:text-yellow-100 p-3 rounded-full disabled:text-stone-600 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={isLoading || hasUsedRitual}
                  aria-label="Daily Resonance Ritual"
                >
                  <SunriseIcon className="w-6 h-6"/>
                </button>
                <button
                    type="button"
                    onClick={() => setIsSearchModeActive(prev => !prev)}
                    className={`p-3 rounded-full transition-all duration-200 ${isSearchModeActive ? 'text-blue-400 bg-blue-500/20' : 'text-stone-400 hover:text-stone-200'}`}
                    disabled={isLoading}
                    aria-label="Cosmic Search"
                >
                    <GlobeIcon className="w-6 h-6"/>
                </button>
                 <button
                    type="button"
                    onClick={handleListen}
                    className={`p-3 rounded-full transition-all duration-200 ${isListening ? 'text-red-400 bg-red-500/20 animate-pulse' : 'text-stone-400 hover:text-stone-200'}`}
                    disabled={isLoading || !recognition}
                    aria-label="Use Microphone"
                >
                    <MicrophoneIcon className="w-6 h-6"/>
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder={isListening ? "Listening..." : isSearchModeActive ? "Ask about cosmic events, transits..." : "Share what is on your mind..."}
                className="flex-1 bg-stone-900/80 p-3 rounded-lg border border-stone-700 focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-stone-500 resize-none max-h-40 overflow-y-auto"
                disabled={isLoading}
                rows={1}
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full disabled:bg-stone-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-900/30 flex items-center justify-center w-12 h-12 self-end"
                disabled={isLoading || !userInput.trim()}
              >
                {isLoading ? <LoaderIcon className="w-5 h-5"/> : <SendIcon className="w-5 h-5"/>}
              </button>
            </form>
          </footer>
        </div>
        <div className="hidden lg:flex flex-col h-full">
            <div className="bg-stone-900/50 rounded-2xl flex flex-col h-full shadow-lg border border-stone-800">
                <div className="flex-shrink-0 p-2 border-b border-stone-800">
                    <div className="flex items-center space-x-2 bg-stone-900/70 p-1 rounded-lg">
                        <TabButton active={activeSidePanel === 'writings'} onClick={() => setActiveSidePanel('writings')}> Writings </TabButton>
                        <TabButton active={activeSidePanel === 'editor'} onClick={() => setActiveSidePanel('editor')}> Editor </TabButton>
                        <TabButton active={activeSidePanel === 'journal'} onClick={() => setActiveSidePanel('journal')}> <JournalIcon className="w-4 h-4" /> Journal </TabButton>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {activeSidePanel === 'writings' && <WritingsPanel writings={writings} setWritings={setWritings} />}
                    {activeSidePanel === 'editor' && <ImageEditorPanel />}
                    {activeSidePanel === 'journal' && (
                      <EvolutionJournalPanel 
                        journal={journal} 
                        onSummarize={handleJournalSummary} 
                        isLoading={isLoading}
                        onPlayGuidedReflection={handlePlayGuidedReflection}
                        isAudioLoading={isAudioLoading}
                        currentlyPlaying={currentlyPlaying}
                      />
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;