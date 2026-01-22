
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Devotional } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getTranslation = () => localStorage.getItem('bible_translation') || 'NIV';
const getTone = () => localStorage.getItem('ai_tone') || 'gentle';

export const generateDailyDevotional = async (): Promise<Devotional> => {
  const ai = getAI();
  const translation = getTranslation();
  const tone = getTone();

  let toneInstruction = "encouraging and gentle language";
  if (tone === 'deep') toneInstruction = "theological, scholarly, and insightful language with historical context";
  if (tone === 'practical') toneInstruction = "practical, bold, and application-focused language";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a Christian devotional writer. Generate a short daily devotional. Select a powerful Bible verse from the ${translation} version and write a devotional around it. Requirements: 120–180 words of text, use a ${toneInstruction}, youth-friendly tone, no controversial theology.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          verse: { type: Type.STRING },
          reference: { type: Type.STRING },
          reflection: { type: Type.STRING, description: "The devotional text (120-180 words)" },
          reflectionQuestion: { type: Type.STRING },
          shortPrayer: { type: Type.STRING },
        },
        required: ["title", "verse", "reference", "reflection", "reflectionQuestion", "shortPrayer"]
      },
    },
  });

  const responseText: string = response.text || "{}";
  const data = JSON.parse(responseText);
  
  return {
    title: data.title || "Daily Devotional",
    verse: data.verse || "",
    reference: data.reference || translation,
    reflection: data.reflection || "",
    reflectionQuestion: data.reflectionQuestion || "",
    shortPrayer: data.shortPrayer || "",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  };
};

export const streamDevotionalAudio = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this Christian devotional in a warm, calm, and peaceful voice: ${text}` }] }],
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
  return base64Audio || "";
};

export const askTheBible = async (question: string, history: { role: string; text: string }[]): Promise<string> => {
  const ai = getAI();
  const translation = getTranslation();
  const tone = getTone();

  let toneInstruction = "friendly Christian mentor and Bible teacher";
  if (tone === 'deep') toneInstruction = "knowledgeable Bible scholar and historian";
  if (tone === 'practical') toneInstruction = "bold practical life coach and spiritual mentor";
  
  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    history: history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model' as 'user' | 'model',
      parts: [{ text: h.text }]
    })),
    config: {
      systemInstruction: `You are 'Bible Buddy', a ${toneInstruction}. Your goal is to answer questions clearly and kindly. Rules: 1. Use youth-friendly language. 2. Avoid any judgment. 3. Always reference Bible verses using the ${translation} version. 4. Encourage faith. 5. Keep the total answer under 250 words. 6. End with one gentle follow-up reflection question.`,
    },
  });

  const response = await chat.sendMessage({ message: question });
  return response.text || "I'm sorry, I couldn't generate a response right now. Please try rephrasing your question.";
};

export const rewritePrayer = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a compassionate prayer helper. Rewrite this prayer request in a gentle, respectful, and encouraging way without changing its meaning: "${text}". Rules: Keep it under 80 words. Warm and supportive tone.`,
  });
  return response.text || text;
};

export const getSearchGroundedDevotional = async (topic: string): Promise<Devotional> => {
  const ai = getAI();
  const translation = getTranslation();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find recent encouraging news and connect them to a biblical principle using the ${translation} version. Create a devotional titled: ${topic}.`,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web)
    .filter((web: any) => web && web.uri)
    .map((web: any) => ({ uri: web.uri, title: web.title || 'Source' }));

  return {
    title: topic,
    verse: "Psalm 118:24",
    reference: translation,
    reflection: response.text || "No reflection generated.",
    reflectionQuestion: "How can you be a light today?",
    shortPrayer: "Lord, help us to see your goodness in the world.",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    sources: sources || []
  };
};
