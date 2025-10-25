export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  isRitual?: boolean; // To identify special message types
  mandalaThought?: string; // The inspiring thought for the mandala
  sources?: Source[]; // For Google Search grounding results
}

export interface Source {
  uri: string;
  title: string;
}

export interface ParsedAllyResponse {
  tone?: string;
  theme?: string;
  reflection?: string;
  action?: string;
  memorySuggestion?: 'Save' | 'No Save';
  raw: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  tone?: string;
  theme?: string;
  reflection: string;
  action: string;
}