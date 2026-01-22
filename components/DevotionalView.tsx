
import React, { useState, useEffect, useRef } from 'react';
import { Devotional } from '../types';
import { generateDailyDevotional, getSearchGroundedDevotional, streamDevotionalAudio } from '../services/geminiService';
import { Loader, Card, Badge, SectionTitle } from './Shared';
import { supabaseService } from '../services/supabaseService';

const TOPICS = [
  { id: 'daily', label: 'Daily Bread', icon: '🍞' },
  { id: 'anxiety', label: 'Peace', icon: '🕊️' },
  { id: 'strength', label: 'Strength', icon: '🛡️' },
  { id: 'purpose', label: 'Purpose', icon: '🧭' },
  { id: 'joy', label: 'Joy', icon: '✨' },
];

const DevotionalView: React.FC = () => {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState('daily');
  const [isSaved, setIsSaved] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.cycle === currentCycle) {
          setDevotional(parsed.data);
          setLoading(false);
          // If we just loaded the daily bread, pre-fetch other popular topics in background
          if (topicId === 'daily') prefetchPopularTopics();
          return;
        }
      }
    }

    try {
      let data;
      if (topicId === 'daily') {
        data = await generateDailyDevotional();
      } else {
        const topicLabel = TOPICS.find(t => t.id === topicId)?.label || topicId;
        data = await getSearchGroundedDevotional(topicLabel);
      }

      setDevotional(data);
      localStorage.setItem(cacheKey, JSON.stringify({
        cycle: currentCycle,
        data
      }));
      
      await supabaseService.updateStats('devo');
      if (topicId === 'daily') prefetchPopularTopics();
    } catch (error) {
      console.error("Error fetching devotional:", error);
    } finally {
      setLoading(false);
    }
  };

  const prefetchPopularTopics = async () => {
    const currentCycle = getCycleKey();
    const popular = TOPICS.filter(t => t.id !== 'daily').slice(0, 2);
    
    for (const topic of popular) {
      const cacheKey = `devo_cache_${topic.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.cycle === currentCycle) continue;
      }
      
      // Fetch in background without blocking
      getSearchGroundedDevotional(topic.label).then(data => {
        localStorage.setItem(cacheKey, JSON.stringify({
          cycle: currentCycle,
          data
        }));
      }).catch(err => console.debug("Silent prefetch fail:", err));
    }
  };

  useEffect(() => {
    fetchDevo('daily');
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
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
      const audioData = await streamDevotionalAudio(`${devotional.title}. ${devotional.verse}. ${devotional.reflection}. Amen.`);
      if (audioData) {
        const byteCharacters = atob(audioData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pcm16Data = new Int16Array(byteArray.buffer);
        
        const wavBlob = createWavBlob(pcm16Data, 24000);
        const url = URL.createObjectURL(wavBlob);
        
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("TTS error:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const createWavBlob = (pcmData: Int16Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length * 2, true);
    let offset = 44;
    for (let i = 0; i < pcmData.length; i++, offset += 2) view.setInt16(offset, pcmData[i], true);
    return new Blob([buffer], { type: 'audio/wav' });
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse px-1">
      <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6"></div>
      <div className="flex gap-2 overflow-hidden mb-6">
        {[1,2,3,4,5].map(i => <div key={i} className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>)}
      </div>
      <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] mb-6 shadow-sm"></div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-end justify-between px-1">
        <SectionTitle title={devotional?.title || activeTopic} subtitle={devotional?.date} />
        <button 
          onClick={handleListen}
          disabled={isAudioLoading}
          className={`mb-6 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all active:scale-90 shadow-lg ${
            isPlaying ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-900 text-indigo-600 border border-indigo-50 dark:border-indigo-900/30'
          }`}
        >
          {isAudioLoading ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : isPlaying ? 'Pause' : 'Listen'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => { setActiveTopic(topic.id); fetchDevo(topic.id); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-bold text-sm transition-all active:scale-95 ${
              activeTopic === topic.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-500 border border-slate-100 dark:border-slate-800/50 hover:bg-white'
            }`}
          >
            <span>{topic.icon}</span>
            {topic.label}
          </button>
        ))}
      </div>

      {devotional && (
        <>
          <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-indigo-600 to-indigo-900 text-white min-h-[300px] flex flex-col justify-end p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 space-y-4">
              <Badge color="yellow">SCRIPTURE</Badge>
              <p className="text-2xl md:text-3xl font-bold italic">"{devotional.verse}"</p>
              <p className="font-bold text-indigo-200 text-sm tracking-widest uppercase">— {devotional.reference}</p>
            </div>
          </Card>

          <div className="space-y-8 px-1">
            <div className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed space-y-4 font-medium">
              {devotional.reflection}
            </div>

            <Card className="bg-white/80 dark:bg-slate-900/60 border-l-4 border-l-indigo-600 shadow-sm">
               <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">PONDER</h4>
               <p className="text-slate-900 dark:text-white font-bold text-lg leading-snug">{devotional.reflectionQuestion}</p>
            </Card>

            <div className="py-12 px-8 rounded-[2.5rem] bg-indigo-50/40 dark:bg-indigo-900/10 text-center border border-indigo-100/30">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">PRAYER</h3>
              <p className="text-indigo-900 dark:text-indigo-200 text-xl font-bold italic leading-relaxed">"{devotional.shortPrayer}"</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DevotionalView;
