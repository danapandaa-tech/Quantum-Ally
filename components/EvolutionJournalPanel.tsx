import React from 'react';
import { JournalEntry } from '../types';
import { SparkleIcon, LoaderIcon, JournalIcon, HeadphonesIcon } from './icons';

interface EvolutionJournalPanelProps {
  journal: JournalEntry[];
  onSummarize: () => void;
  isLoading: boolean;
  onPlayGuidedReflection: (entry: JournalEntry) => void;
  isAudioLoading: boolean;
  currentlyPlaying: string | null;
}

export const EvolutionJournalPanel: React.FC<EvolutionJournalPanelProps> = ({ 
  journal, 
  onSummarize, 
  isLoading,
  onPlayGuidedReflection,
  isAudioLoading,
  currentlyPlaying
}) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-medium text-purple-300 mb-2">Evolution Journal</h2>
        <p className="text-sm text-stone-400 mb-4">
          A log of your saved reflections. Witness your journey unfold.
        </p>
        <button
          onClick={onSummarize}
          disabled={isLoading || journal.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-purple-600/80 hover:bg-purple-600 text-white p-3 rounded-lg disabled:bg-stone-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-900/30 mb-6"
        >
          {isLoading ? (
            <>
              <LoaderIcon className="w-5 h-5" />
              <span>Reflecting...</span>
            </>
          ) : (
            <>
              <SparkleIcon className="w-5 h-5" />
              <span>Reflect on My Journey</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {journal.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-stone-500">
            <JournalIcon className="w-12 h-12 mb-4" />
            <p>Your saved reflections will appear here.</p>
            <p className="text-xs">Press 'Save' on a message to begin.</p>
          </div>
        )}
        {journal.slice().reverse().map(entry => (
          <div key={entry.id} className="bg-stone-900/70 p-4 rounded-lg border border-stone-800">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <span className="text-xs font-semibold text-purple-300">{entry.date}</span>
                    {entry.tone && <span className="text-xs text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full ml-2">{entry.tone}</span>}
                </div>
                <button
                    onClick={() => onPlayGuidedReflection(entry)}
                    disabled={isAudioLoading}
                    className="p-1 rounded-full text-purple-300 hover:bg-purple-500/20 disabled:text-stone-600 transition-colors"
                    aria-label="Play guided reflection"
                >
                    {isAudioLoading && currentlyPlaying === `guided-${entry.id}` ? (
                        <LoaderIcon className="w-5 h-5" />
                    ) : (
                        <HeadphonesIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
            {entry.theme && <p className="text-xs text-stone-500 mb-2">Theme: {entry.theme}</p>}
            <p className="text-sm text-stone-200 italic mb-3">“{entry.reflection}”</p>
            <p className="text-sm text-stone-300 border-t border-stone-700 pt-2"><strong className="font-medium text-stone-400">Action:</strong> {entry.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
};