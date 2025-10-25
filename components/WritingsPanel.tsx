
import React from 'react';

interface WritingsPanelProps {
  writings: string;
  setWritings: (writings: string) => void;
}

export const WritingsPanel: React.FC<WritingsPanelProps> = ({ writings, setWritings }) => {
  return (
    <div className="bg-stone-900/50 p-6 rounded-2xl flex flex-col h-full shadow-lg border border-stone-800">
      <h2 className="text-xl font-medium text-purple-300 mb-4">Your Writings</h2>
      <p className="text-sm text-stone-400 mb-4">
        Paste any personal writings here. Quantum Ally can reference them to provide more resonant reflections. This is optional.
      </p>
      <textarea
        value={writings}
        onChange={(e) => setWritings(e.target.value)}
        placeholder="The universe whispered..."
        className="w-full h-full bg-stone-950 text-stone-300 p-4 rounded-lg border border-stone-700 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none placeholder-stone-600 text-sm"
      />
    </div>
  );
};
