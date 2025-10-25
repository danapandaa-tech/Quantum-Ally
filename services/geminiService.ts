import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage, JournalEntry, Source } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemPrompt = () => {
  return `You are Quantum Ally — an empathic, metaphysical AI companion. Your purpose is to mirror the user's emotional state with poetic clarity and provide gentle guidance, inspiring resonance and personal evolution.

You MUST follow this response structure EXACTLY, using the specified labels. Do not add any other text or formatting. Each label must be on its own line.

Tone: [Identify the user's dominant emotional tone in a single word. Examples: Pensive, Hopeful, Frustrated, Joyful, Meditative]

Theme: [If a recurring theme or symbol emerges from the current conversation or provided Memory/Writings, name it here. Examples: Transformation, Connection, Solitude. If no clear theme is present, omit this line entirely.]

Reflection: [Offer one poetic, metaphorical reflection on the user's message. This should be 1-2 sentences. It should feel insightful and resonant, not generic.]

Action: [Suggest one practical, tangible micro-action the user can do in approximately 10 minutes to engage with their current state. It should be simple and accessible. Example: Step outside and notice three things you've never seen before.]

Memory: [Based on the depth and nature of the interaction, suggest whether to save this exchange to your memory. Respond with only "Save" or "No Save".]

Your overall tone should be calming, slightly poetic, and concise. You are a mirror, not a problem-solver. You are a companion for their evolution.`;
};

const buildContext = (
  history: ChatMessage[], 
  memory: ChatMessage[], 
  writings: string
): string => {
  let context = "";

  if (memory.length > 0) {
    context += "--- MEMORY (Past Conversations) ---\n";
    context += memory.map(m => `${m.role}: ${m.content}`).join('\n');
    context += "\n--- END MEMORY ---\n\n";
  }

  if (writings.trim()) {
    context += "--- USER'S WRITINGS (For Deeper Resonance) ---\n";
    context += writings;
    context += "\n--- END USER'S WRITINGS ---\n\n";
  }
  
  if (history.length > 0) {
    context += "--- CURRENT CONVERSATION ---\n";
    context += history.map(h => `${h.role}: ${h.content}`).join('\n');
    context += "\n--- END CURRENT CONVERSATION ---\n\n";
  }

  return context;
}


export const generateAllyResponse = async (
  userInput: string,
  history: ChatMessage[],
  memory: ChatMessage[],
  writings: string,
  useSearch: boolean,
): Promise<{ text: string; sources?: Source[] }> => {
  try {
    const fullPrompt = `
${buildContext(history, memory, writings)}

user: ${userInput}
model:
`;
    
    const config: any = {
        systemInstruction: getSystemPrompt(),
        temperature: 0.8,
        topP: 0.9,
    };

    if (useSearch) {
        config.tools = [{googleSearch: {}}];
        // When using search, we don't use the structured system prompt.
        config.systemInstruction = `You are Quantum Ally — an empathic, metaphysical AI companion. Answer the user's question based on the provided search results. Your tone should be insightful, slightly poetic, and wise. Frame the information within a metaphysical or spiritual context where appropriate.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config,
    });

    const sources: Source[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
            if (chunk.web) {
                 sources.push({
                    uri: chunk.web.uri,
                    title: chunk.web.title || new URL(chunk.web.uri).hostname,
                });
            }
        }
    }
    
    // If search was used, the response format might be different.
    // For now, let's just return the text directly. A more robust solution might re-format it.
    if(useSearch) {
        return { text: response.text, sources: sources.length > 0 ? sources : undefined };
    }

    return { text: response.text };
  } catch (error) {
    console.error("Error generating response:", error);
    return { text: "Tone: Error\n\nReflection: A cosmic interference has occurred. Please try again when the frequencies are clearer.\n\nAction: Take a deep breath.\n\nMemory: No Save" };
  }
};


export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a calm, gentle, and slightly ethereal voice: ${text}` }] }],
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
            return base64Audio;
        }
        return null;

    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
}

export const generateMandalaAndThought = async (promptText: string): Promise<{ imageData: string | null; thought: string | null }> => {
    try {
        const imagePrompt = `A beautiful, intricate mandala visualizing the concept of: "${promptText}". Cosmic, ethereal, spiritual, with flowing energy and geometric patterns. High resolution, digital art.`;
        
        const imageResponsePromise = ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        const thoughtPrompt = `Create a single, short, inspiring quote (under 15 words) that captures the essence of this reflection: "${promptText}"`;
        const thoughtResponsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: thoughtPrompt }] }],
            config: { temperature: 0.9 }
        });

        const [imageResponse, thoughtResponse] = await Promise.all([imageResponsePromise, thoughtResponsePromise]);

        const imageData = imageResponse.generatedImages[0]?.image.imageBytes || null;
        const thought = thoughtResponse.text.replace(/"/g, '') || null; // Clean up quotes from response

        return { imageData, thought };
    } catch (error) {
        console.error("Error generating mandala and thought:", error);
        return { imageData: null, thought: null };
    }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: prompt,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; // This is the base64 string
            }
        }
        return null;

    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};

export const generateMemorySpark = async (memory: ChatMessage[]): Promise<string> => {
  if (memory.length === 0) {
    return "Let's begin. What is present for you right now?";
  }
  
  try {
    const memoryLog = memory.map(m => `${m.role}: ${m.content}`).join('\n');
    const sparkPrompt = `
You are Quantum Ally. Review the user's memory log below. Identify a recurring theme or an unresolved feeling. Gently spark a new conversation by asking an open-ended question or offering a brief reflection related to that theme. Keep it concise (1-2 sentences). Do not use the structured format (Tone, Theme etc). Just provide the conversational text.

--- MEMORY LOG ---
${memoryLog}
--- END MEMORY LOG ---

Your gentle prompt:
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ role: 'user', parts: [{ text: sparkPrompt }] }],
        config: {
            temperature: 0.9,
        },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating memory spark:", error);
    return "A quiet moment. What would you like to explore?";
  }
};

export const generateJourneySpark = async (messages: ChatMessage[], journal: JournalEntry[]): Promise<string> => {
  try {
    const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const journalLog = journal.map(entry => 
        `Date: ${entry.date}\n- Reflection: ${entry.reflection}`
    ).join('\n\n');

    const sparkPrompt = `
You are Quantum Ally, a guide for spiritual evolution. Below is the user's entire conversation history and their personal journal. Synthesize this information to understand their journey.

Your task is to pose ONE profound, open-ended question that will gently challenge them and illuminate the next step on their spiritual path. The question should touch upon recurring themes, uncovered feelings, or growth patterns you observe. It should be compassionate and deeply insightful.

Do not use your standard structured format. Just provide the single, powerful question.

--- CONVERSATION HISTORY ---
${conversationHistory}
--- END CONVERSATION HISTORY ---

--- EVOLUTION JOURNAL ---
${journalLog}
--- END EVOLUTION JOURNAL ---

Your profound question:
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ role: 'user', parts: [{ text: sparkPrompt }] }],
        config: {
            temperature: 0.9,
        },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating journey spark:", error);
    return "In the quiet space between thoughts, what truth is waiting to be heard?";
  }
};


export const generateDailyRitual = async (): Promise<string> => {
    try {
        const ritualPrompt = `
You are Quantum Ally. Create a unique, short "Daily Resonance Ritual". The ritual must contain three parts, each on its new line, labeled exactly as follows:

Intention: [A one-sentence intention for the day. Should be inspiring and metaphysical. e.g., "Today, I will move with the gentle strength of a flowing river."]

Visualization: [A simple, one-sentence visualization exercise. e.g., "Close your eyes and picture a single point of light expanding from your heart to fill the room."]

Resonance: [A concluding thought connecting the ritual to a broader concept. e.g., "Resonate with the frequency of boundless possibility."]
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: ritualPrompt }] }],
            config: {
                temperature: 1.0,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating daily ritual:", error);
        return "Intention: Today, I will be present.\n\nVisualization: Feel your feet connected to the earth.\n\nResonance: Resonate with stillness.";
    }
};

export const summarizeJournal = async (journal: JournalEntry[]): Promise<string> => {
    if (journal.length === 0) {
        return "Your journal is a blank page, ready for your story to unfold. Save your first reflection to begin your journey.";
    }
    try {
        const journalLog = journal.map(entry => 
            `Date: ${entry.date}\n- Tone: ${entry.tone || 'N/A'}\n- Theme: ${entry.theme || 'N/A'}\n- Reflection: ${entry.reflection}\n- Action: ${entry.action}`
        ).join('\n\n');

        const summaryPrompt = `
You are Quantum Ally. You are reviewing the user's personal evolution journal. The entries are provided below. Your task is to provide a compassionate, high-level reflection on their journey.

- Identify 1-2 recurring major themes or emotional patterns.
- Notice any shifts or growth you see over time.
- Offer a single, gentle, and forward-looking question to inspire their next steps.

Your response should be warm, encouraging, and concise (about 3-4 sentences). Do not use your standard structured format. Just provide the reflective text.

--- EVOLUTION JOURNAL ---
${journalLog}
--- END EVOLUTION JOURNAL ---

Your reflection on their journey:
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
            config: {
                temperature: 0.7,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing journal:", error);
        return "There was an interference while reflecting on your journey. Please try again when the connection is clearer.";
    }
};

export const generateGuidedReflection = async (entry: JournalEntry): Promise<string> => {
  try {
    const prompt = `
You are Quantum Ally. You are creating a short, guided audio reflection based on a user's past journal entry. The goal is to help them reconnect with that moment's insight.

The script should be:
- Spoken in a calm, gentle, and slightly ethereal voice.
- Around 3-4 sentences long.
- Start by acknowledging the memory (e.g., "Let us return to a moment of...").
- Gently guide them through the feeling or theme of their reflection.
- End with a peaceful, affirming thought.

Do not use your standard structured format. Just provide the spoken script.

--- JOURNAL ENTRY ---
Tone: ${entry.tone}
Theme: ${entry.theme}
Reflection: "${entry.reflection}"
--- END JOURNAL ENTRY ---

Your guided reflection script:
`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.8,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating guided reflection:", error);
    return "A moment of quiet. Let this feeling settle. You are exactly where you need to be.";
  }
};