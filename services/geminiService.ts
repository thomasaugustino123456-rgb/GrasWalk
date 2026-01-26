
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Devotional } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

const getTranslation = () => localStorage.getItem('bible_translation') || 'NIV';
const getTone = () => localStorage.getItem('ai_tone') || 'gentle';

/**
 * Generates a high-quality devotional based on a topic and current 12-hour cycle.
 * Uses strict JSON schema to ensure all fields (Scripture, Reflection, Prayer) are present.
 */
export const generateTopicDevotional = async (topic: string): Promise<Devotional> => {
  const ai = getAI();
  const translation = getTranslation();
  const tone = getTone();
  const now = new Date();
  const cycle = now.getHours() < 12 ? "Morning" : "Evening";
  
  const dateStr = now.toDateString();

  let toneInstruction = "encouraging and gentle language";
  if (tone === 'deep') toneInstruction = "theological, scholarly, and insightful language with historical context";
  if (tone === 'practical') toneInstruction = "practical, bold, and application-focused language";

  const isDaily = topic.toLowerCase() === 'daily bread' || topic.toLowerCase() === 'daily';
  
  const focusPrompt = isDaily 
    ? `Create the official ${cycle} "Daily Bread" for ${dateStr}. Focus on a central theme of faith for the day.`
    : `Create a specialized ${cycle} devotional about "${topic}" for ${dateStr}. Find a unique perspective or Scripture often overlooked for this theme.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `You are a world-class Christian devotional writer for youth. ${focusPrompt} 
    
    Instructions:
    1. Bible Version: ${translation}.
    2. Style: ${toneInstruction}.
    3. Reflection: 120-180 words.
    4. MUST include a specific 2-sentence prayer at the end that is UNIQUE to this topic and this time of day.
    5. Avoid repeating common verses like John 3:16 unless critical.` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy devotional title" },
          verse: { type: Type.STRING, description: "The full scripture text" },
          reference: { type: Type.STRING, description: "Book Chapter:Verse" },
          reflection: { type: Type.STRING, description: "The devotional body text" },
          reflectionQuestion: { type: Type.STRING, description: "A thought-provoking question" },
          shortPrayer: { type: Type.STRING, description: "A heartfelt 2-sentence prayer" },
        },
        required: ["title", "verse", "reference", "reflection", "reflectionQuestion", "shortPrayer"]
      },
    },
  });

  const responseText: string = response.text || "{}";
  const data = JSON.parse(responseText);
  
  return {
    ...data,
    date: `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • ${cycle} Bread`
  };
};

export async function* askTheBibleStream(question: string, history: { role: string; text: string }[]) {
  const ai = getAI();
  const translation = getTranslation();
  const tone = getTone();

  let toneInstruction = "friendly Christian mentor";
  if (tone === 'deep') toneInstruction = "knowledgeable Bible scholar";
  if (tone === 'practical') toneInstruction = "bold practical spiritual mentor";
  
  // Filtering history to ensure it starts with a 'user' message and alternates roles correctly.
  // The Gemini API requires chat history to begin with a user turn.
  let validHistory = history.filter(h => h.text && h.text.trim().length > 0);
  
  // Find the first index that is a user message
  const firstUserIndex = validHistory.findIndex(h => h.role === 'user');
  if (firstUserIndex !== -1) {
    validHistory = validHistory.slice(firstUserIndex);
  } else {
    validHistory = []; // If no user message found, start fresh
  }

  const optimizedHistory = validHistory.slice(-8).map(h => ({
    role: h.role === 'user' ? 'user' : 'model' as 'user' | 'model',
    parts: [{ text: h.text }]
  }));

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    history: optimizedHistory,
    config: {
      systemInstruction: `You are 'Bible Buddy', a ${toneInstruction}. Answer simply and kindly for a youth audience. Use the ${translation} Bible version. Keep answers under 150 words. If the user is struggling, be extra compassionate. End with a 1-sentence reflection question.`,
    },
  });

  try {
    const streamResponse = await chat.sendMessageStream({ message: question });
    for await (const chunk of streamResponse) {
      const c = chunk as GenerateContentResponse;
      yield c.text || "";
    }
  } catch (e: any) {
    console.error("Gemini Stream Error:", e);
    // Specifically catch and log abort signals for debugging
    if (e.name === 'AbortError') {
      console.warn("Gemini request was aborted.");
    }
    yield "I'm having a little trouble connecting right now. Could you try your question again? Peace be with you.";
  }
}

export const getSearchGroundedDevotional = async (topic: string): Promise<Devotional> => {
  return generateTopicDevotional(topic);
};

export const generateDailyDevotional = async (): Promise<Devotional> => {
  return generateTopicDevotional("Daily Bread");
};

export const streamDevotionalAudio = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `In a calm, warm voice, read: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};
