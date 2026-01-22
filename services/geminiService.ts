
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Devotional } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getTranslation = () => localStorage.getItem('bible_translation') || 'NIV';
const getTone = () => localStorage.getItem('ai_tone') || 'gentle';

export const generateDailyDevotional = async (): Promise<Devotional> => {
  const ai = getAI();
  const translation = getTranslation();
  const tone = getTone();
  const cycle = new Date().getHours() < 12 ? "Morning" : "Evening";

  let toneInstruction = "encouraging and gentle language";
  if (tone === 'deep') toneInstruction = "theological, scholarly, and insightful language with historical context";
  if (tone === 'practical') toneInstruction = "practical, bold, and application-focused language";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a Christian devotional writer. Generate a ${cycle} devotional for a youth-friendly audience. Select a powerful Bible verse from the ${translation} version. Requirements: 120–180 words of text, use a ${toneInstruction}, focusing on ${cycle === 'Morning' ? 'starting the day with God' : 'reflecting on God\'s goodness at the end of the day'}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          verse: { type: Type.STRING },
          reference: { type: Type.STRING },
          reflection: { type: Type.STRING },
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
  
  const optimizedHistory = history.slice(-8).map(h => ({
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
  } catch (e) {
    console.error("Gemini Stream Error:", e);
    yield "I'm having a little trouble connecting right now. Could you try your question again? Peace be with you.";
  }
}

export const getSearchGroundedDevotional = async (topic: string): Promise<Devotional> => {
  const ai = getAI();
  const translation = getTranslation();
  const cycle = new Date().getHours() < 12 ? "Morning" : "Evening";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find encouraging news or principles about "${topic}" and create a ${cycle} devotional. Requirements: Bible verse from ${translation}, 100-word reflection, a deep reflection question, and a 2-sentence prayer. Format the output clearly.`,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const text = response.text || "";
  
  return {
    title: topic,
    verse: text.match(/"([^"]+)"/)?.[1] || "Trust in the Lord with all your heart.",
    reference: text.match(/([A-Z][a-z]+ \d+:\d+)/)?.[0] || translation,
    reflection: text.length > 500 ? text.substring(0, 500) + "..." : text,
    reflectionQuestion: "How does this truth change your view of today?",
    shortPrayer: "Lord, thank You for Your presence in this area of my life. Guide my steps. Amen.",
    date: `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • ${topic}`,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter(Boolean) || []
  };
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
