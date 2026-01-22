
import React, { useState, useEffect, useRef } from 'react';
import { Devotional } from '../types';
import { generateTopicDevotional, streamDevotionalAudio } from '../services/geminiService';
import { Loader, Card, Badge, SectionTitle } from './Shared';
import { supabaseService } from '../services/supabaseService';

const TOPICS = [
  { id: 'daily', label: 'Daily Bread', icon: '🍞' },
  { id: 'anxiety', label: 'Peace', icon: '🕊️' },
  { id: 'strength', label: 'Strength', icon: '🛡️' },
  { id: 'purpose', label: 'Purpose', icon: '🧭' },
  { id: 'joy', label: 'Joy', icon: '✨' },
];

// Helper to decode base64 string to Uint8Array as per Gemini API guidelines.
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM data to AudioBuffer as per Gemini API guidelines.
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

const DevotionalView: React.FC = () => {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState('daily');
  const [isSaved, setIsSaved] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  /**
   * Generates a key for the 12-hour cycle (e.g., 2025-01-22_AM)
   */
  const getCycleKey = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const cycle = now.getHours() < 12 ? 'AM' : 'PM';
    return `${date}_${cycle}`;
  };

  const fetchDevo = async (topicId: string, forceRefresh = false) => {
    setLoading(true);
    setIsSaved(false);
    stopAudio();

    const currentCycle = getCycleKey();
    const cacheKey = `devo_cache_${topicId}`;

    // 12-Hour Freshness Logic: Every topic has its own distinct AM/PM slot
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.cycle === currentCycle) {
          setDevotional(parsed.data);
          setLoading(false);
          return;
        }
      }
    }

    try {
      const topicLabel = TOPICS.find(t => t.id === topicId)?.label || topicId;
      const data = await generateTopicDevotional(topicLabel);

      setDevotional(data);
      
      // Store in cycle-aware local storage for this specific topic
      localStorage.setItem(cacheKey, JSON.stringify({
        cycle: currentCycle,
        data
      }));
      
      await supabaseService.updateStats('devo');
    } catch (error) {
      console.error("Error fetching devotional:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevo('daily');
    return () => stopAudio();
  }, []);

  const handleTopicChange = (topicId: string) => {
    if (topicId === activeTopic) return;
    setActiveTopic(topicId);
    fetchDevo(topicId);
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Source might have already stopped
      }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleListen = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }
    if (!devotional) return;

    setIsAudioLoading(true);
    try {
      // Audio is raw PCM data from Gemini TTS
      const audioData = await streamDevotionalAudio(`${devotional.title}. ${devotional.verse}. ${devotional.reflection}. Amen.`);
      if (audioData) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const decodedBytes = decodeBase64(audioData);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        
        audioSourceRef.current = source;
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleSaveVerse = async () => {
    if (!devotional || isSaved) return;
    try {
      await supabaseService.saveVerse(devotional.verse, devotional.reference);
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving verse:", error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <SectionTitle title="Daily Bread" subtitle="Nourishment for your spirit." />
      
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {TOPICS.map(topic => (
          <button
            key={topic.id}
            onClick={() => handleTopicChange(topic.id)}
            className={`shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
              activeTopic === topic.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
              : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800'
            }`}
          >
            <span className="mr-2">{topic.icon}</span>
            {topic.label}
          </button>
        ))}
      </div>

      {devotional && (
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden relative group">
            <div className="bg-indigo-600 p-8 text-white">
              <div className="flex justify-between items-start mb-4">
                <Badge color="yellow">Scripture</Badge>
                <button 
                  onClick={handleListen}
                  disabled={isAudioLoading}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-all active:scale-90"
                >
                  {isAudioLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
              </div>
              <p className="text-2xl font-serif italic leading-relaxed">"{devotional.verse}"</p>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest opacity-80">— {devotional.reference}</p>
                <button 
                  onClick={handleSaveVerse}
                  className={`p-2 rounded-full transition-all ${isSaved ? 'text-rose-400 bg-white/10' : 'text-white/60 hover:text-white'}`}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.046 3 5.5L12 21l7-7Z"/></svg>
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                   <h3 className="text-xl font-jakarta font-extrabold text-slate-900 dark:text-white">{devotional.title}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-[1.8] text-lg whitespace-pre-line">
                  {devotional.reflection}
                </p>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">Today's Reflection</h4>
                <p className="text-slate-800 dark:text-slate-100 font-bold italic leading-relaxed text-lg">
                  "{devotional.reflectionQuestion}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">A Moment with God</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                  {devotional.shortPrayer}
                </p>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-slate-50 dark:bg-black/40 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{devotional.date}</span>
               <button 
                 onClick={() => fetchDevo(activeTopic, true)}
                 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors"
               >
                 Refresh Bread
               </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DevotionalView;
