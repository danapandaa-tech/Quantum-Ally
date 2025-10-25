import React, { useMemo } from 'react';
import { ChatMessage, ParsedAllyResponse } from '../types';
import { PlayIcon, PauseIcon, LoaderIcon, ImageIcon, SunriseIcon, ShareIcon } from './icons';

interface MessageBubbleProps {
  message: ChatMessage;
  onSaveToMemory: (userMessage: ChatMessage, modelMessage: ChatMessage) => void;
  lastUserMessage: ChatMessage | null;
  onPlayAudio: (messageId: string, textToSpeak: string) => void;
  onStopAudio: () => void;
  onGenerateMandala: (messageId: string, promptText: string) => void;
  isAudioLoading: boolean;
  isPlaying: boolean;
}

const parseAllyResponse = (content: string): ParsedAllyResponse => {
    // If the content does not start with "Tone:", it might be a grounded or spark response.
    if (!content.trim().startsWith('Tone:')) {
        return {
            reflection: content,
            action: '',
            memorySuggestion: 'No Save',
            raw: content,
        }
    }
    
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const response: ParsedAllyResponse = { raw: content };

    lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        switch (key.trim().toLowerCase()) {
            case 'tone':
                response.tone = value;
                break;
            case 'theme':
                response.theme = value;
                break;
            case 'reflection':
                response.reflection = value;
                break;
            case 'action':
                response.action = value;
                break;
            case 'memory':
                if (value.toLowerCase() === 'save') {
                    response.memorySuggestion = 'Save';
                } else {
                    response.memorySuggestion = 'No Save';
                }
                break;
        }
    });

    return response;
};

const parseRitual = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const ritual: { intention?: string; visualization?: string; resonance?: string } = {};
    lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        switch (key.trim().toLowerCase()) {
            case 'intention':
                ritual.intention = value;
                break;
            case 'visualization':
                ritual.visualization = value;
                break;
            case 'resonance':
                ritual.resonance = value;
                break;
        }
    });
    return ritual;
}

const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
    message, 
    onSaveToMemory, 
    lastUserMessage,
    onPlayAudio,
    onStopAudio,
    onGenerateMandala,
    isAudioLoading,
    isPlaying
}) => {
  const isUser = message.role === 'user';
  const parsedResponse = useMemo(() => (isUser || message.isRitual) ? null : parseAllyResponse(message.content), [isUser, message.content, message.isRitual]);
  const parsedRitual = useMemo(() => message.isRitual ? parseRitual(message.content) : null, [message.isRitual, message.content]);

  const handleSave = () => {
    if (lastUserMessage && parsedResponse?.reflection && parsedResponse?.action) {
      onSaveToMemory(lastUserMessage, message);
    }
  };
  
  const handlePlayButtonClick = () => {
    if (isPlaying) {
      onStopAudio();
    } else if (parsedResponse) {
      const textToSpeak = [parsedResponse.tone, parsedResponse.theme, parsedResponse.reflection, parsedResponse.action].filter(Boolean).join('. ');
      onPlayAudio(message.id, textToSpeak);
    } else if (parsedRitual) {
        const textToSpeak = `Today's Ritual. ${Object.values(parsedRitual).join('. ')}`;
        onPlayAudio(message.id, textToSpeak);
    }
  };
  
  const handleMandalaClick = () => {
      if (parsedResponse?.reflection) {
          onGenerateMandala(message.id, parsedResponse.reflection);
      }
  }
  
  const handleShare = async () => {
    if (!message.imageUrl || !message.mandalaThought) return;

    try {
        const file = dataURLtoFile(message.imageUrl, 'mandala-reflection.jpg');
        if (navigator.share && file && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'A Moment of Reflection',
                text: `"${message.mandalaThought}"`,
                files: [file],
            });
        } else {
            alert('Sharing is not supported on this browser, or the file cannot be shared.');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        alert('An error occurred while trying to share.');
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-purple-600/30 text-stone-200 p-4 rounded-2xl max-w-lg shadow-md border border-purple-500/30">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  if(parsedRitual) {
      return (
        <div className="flex justify-start mb-4">
            <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-5 rounded-2xl max-w-lg w-full shadow-lg border-2 border-purple-500/50 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <SunriseIcon className="w-6 h-6 text-purple-300" />
                        <h3 className="text-lg font-semibold text-purple-300">Daily Resonance Ritual</h3>
                    </div>
                    <button 
                        onClick={handlePlayButtonClick}
                        className="text-purple-300 hover:text-purple-100 transition-colors duration-200 disabled:opacity-50"
                        disabled={isAudioLoading}
                        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                        >
                        {isAudioLoading ? <LoaderIcon className="w-6 h-6 animate-spin"/> : isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                    </button>
                </div>

                {parsedRitual.intention && <p className="text-stone-200 mt-2"><strong className="font-medium text-stone-400">Intention:</strong> {parsedRitual.intention}</p>}
                {parsedRitual.visualization && <p className="text-stone-200 mt-2"><strong className="font-medium text-stone-400">Visualization:</strong> {parsedRitual.visualization}</p>}
                {parsedRitual.resonance && <p className="text-stone-200 mt-2"><strong className="font-medium text-stone-400">Resonance:</strong> {parsedRitual.resonance}</p>}
            </div>
        </div>
      )
  }

  if (!parsedResponse) return null;

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-stone-800/60 p-5 rounded-2xl max-w-lg w-full shadow-lg border border-stone-700/80 backdrop-blur-sm">
        {parsedResponse.tone && (
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <span className="text-xs text-purple-300 uppercase tracking-wider">Tone</span>
                    <span className="text-stone-100 font-medium">{parsedResponse.tone}</span>
                </div>
                <button 
                    onClick={handlePlayButtonClick}
                    className="text-purple-300 hover:text-purple-100 transition-colors duration-200 disabled:opacity-50"
                    disabled={isAudioLoading}
                    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                    >
                    {isAudioLoading ? <LoaderIcon className="w-6 h-6 animate-spin"/> : isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </button>
            </div>
        )}
        
        {parsedResponse.theme && (
          <div className="mb-4 pt-3 border-t border-stone-700">
            <span className="text-xs text-purple-300 uppercase tracking-wider">Theme</span>
            <p className="text-stone-200">{parsedResponse.theme}</p>
          </div>
        )}

        {parsedResponse.reflection && (
          <div className="mb-4 pt-3 border-t border-stone-700">
            <span className="text-xs text-purple-300 uppercase tracking-wider">Reflection</span>
            <p className="text-stone-200 italic whitespace-pre-wrap">{!parsedResponse.tone ? parsedResponse.reflection : `“${parsedResponse.reflection}”`}</p>
          </div>
        )}

        {parsedResponse.action && (
          <div className="mb-4 pt-3 border-t border-stone-700">
            <span className="text-xs text-purple-300 uppercase tracking-wider">Micro-Action</span>
            <p className="text-stone-200">{parsedResponse.action}</p>
          </div>
        )}
        
        {message.sources && message.sources.length > 0 && (
            <div className="mb-4 pt-3 border-t border-stone-700">
                <span className="text-xs text-purple-300 uppercase tracking-wider">Sources</span>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    {message.sources.map((source, index) => (
                        <li key={index} className="text-sm">
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 underline transition-colors">
                                {source.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {message.isGeneratingImage && (
            <div className="flex justify-center items-center h-48 bg-stone-900/50 rounded-lg mt-4">
                <LoaderIcon className="w-12 h-12" />
            </div>
        )}

        {message.imageUrl && (
            <div className="mt-4 pt-4 border-t border-stone-700 space-y-3">
                <img src={message.imageUrl} alt="Generated Mandala" className="rounded-lg w-full" />
                {message.mandalaThought && (
                    <blockquote className="text-center text-purple-200 italic text-sm">
                        "{message.mandalaThought}"
                    </blockquote>
                )}
                {navigator.share && (
                    <div className="flex justify-center">
                        <button 
                            onClick={handleShare}
                            className="flex items-center gap-1.5 text-sm bg-stone-700/70 hover:bg-stone-600/90 text-purple-200 font-semibold py-1 px-3 rounded-full transition-colors duration-200"
                            aria-label="Share Mandala"
                        >
                            <ShareIcon className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                )}
            </div>
        )}

        <div className="pt-4 border-t border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {parsedResponse.reflection && parsedResponse.tone && !message.imageUrl && !message.isGeneratingImage && (
                <button 
                    onClick={handleMandalaClick} 
                    className="flex items-center gap-1.5 text-sm bg-stone-700/70 hover:bg-stone-600/90 text-purple-200 font-semibold py-1 px-3 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={message.isGeneratingImage}
                    aria-label="Visualize Mandala"
                    >
                    <ImageIcon className="w-4 h-4" />
                    Visualize Mandala
                </button>
            )}
          </div>
          {parsedResponse.memorySuggestion === 'Save' ? (
              <button onClick={handleSave} className="text-sm bg-purple-600/50 hover:bg-purple-600/80 text-white font-semibold py-1 px-3 rounded-full transition-colors duration-200">
                  Save
              </button>
          ) : (
            parsedResponse.tone && <span className="text-sm text-stone-500">{parsedResponse.memorySuggestion === 'No Save' ? 'Not Suggested' : ''}</span>
          )}
        </div>

      </div>
    </div>
  );
};