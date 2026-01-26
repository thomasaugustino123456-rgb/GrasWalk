
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

const VOICES = [
  { id: 'Kore', label: 'Warm', desc: 'Default comfort' },
  { id: 'Puck', label: 'Youthful', desc: 'Energetic' },
  { id: 'Charon', label: 'Deep', desc: 'Scholarly' },
  { id: 'Zephyr', label: 'Calm', desc: 'Peaceful' },
];

const SPEEDS = [0.8, 1.0, 1.25, 1.5];

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  
  // Audio Preferences
  const [voice, setVoice] = useState(() => localStorage.getItem('audio_voice') || 'Kore');
  const [speed, setSpeed] = useState(() => parseFloat(localStorage.getItem('audio_speed') || '1.0'));
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    localStorage.setItem('audio_voice', voice);
  }, [voice]);

  useEffect(() => {
    localStorage.setItem('audio_speed', speed.toString());
    if (audioSourceRef.current) {
      audioSourceRef.current.playbackRate.value = speed;
    }
  }, [speed]);

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
          return;
        }
      }
    }

    try {
      const topicLabel = TOPICS.find(t => t.id === topicId)?.label || topicId;
      const data = await generateTopicDevotional(topicLabel);

      setDevotional(data);
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
      try { audioSourceRef.current.stop(); } catch (e) {}
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
      const audioData = await streamDevotionalAudio(
        `${devotional.title}. ${devotional.verse}. ${devotional.reflection}. Amen.`,
        voice
      );
      if (audioData) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const decodedBytes = decodeBase64(audioData);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = speed;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          setIsPlaying(false);
          audioSourceRef.current = null;
        };
        
        source.start();
        audioSourceRef.current = source;
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleNativeShare = async () => {
    if (!devotional) return;
    try {
      await navigator.share({
        title: 'GraceWalk Devotional',
        text: `"${devotional.verse}" - ${devotional.reference}. Check out today's GraceWalk Devotional: ${devotional.title}`,
        url: window.location.href,
      });
      setShowShareMenu(false);
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleRedditShare = async () => {
    if (!devotional) return;
    const redditMarkdown = `
# 🍞 Today's GraceWalk Devotional: ${devotional.title}

> "${devotional.verse}" 
> — **${devotional.reference}**

**Reflection:**
${devotional.reflection}

**Ponder this:**
*${devotional.reflectionQuestion}*

**A Moment with God:**
${devotional.shortPrayer}

---
*Shared from [GraceWalk](${window.location.origin}) — Your AI-powered Christian companion.*
    `.trim();

    try {
      await navigator.clipboard.writeText(redditMarkdown);
      alert('Reddit-formatted Markdown copied! Go to r/Christianity and paste this into a new post.');
      setShowShareMenu(false);
    } catch (err) {
      console.error("Reddit share error:", err);
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
            <div className="bg-indigo-600 p-8 text-white relative">
              <div className="flex justify-between items-start mb-4">
                <Badge color="yellow">Scripture</Badge>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => { setShowShareMenu(!showShareMenu); setShowAudioSettings(false); }}
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-all active:scale-90"
                      title="Share Devotional"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                        <button onClick={handleNativeShare} className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                          Share to Apps
                        </button>
                        <button onClick={handleRedditShare} className="w-full px-4 py-3 text-left text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 border-t border-slate-50 dark:border-slate-800">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M17 12h-5v5"/><path d="M7 12h5V7"/></svg>
                          Copy for Reddit
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => { setShowAudioSettings(!showAudioSettings); setShowShareMenu(false); }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${showAudioSettings ? 'bg-white/40' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>

                    {showAudioSettings && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 z-50 p-6 animate-in zoom-in-95 duration-200 origin-top-right space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Voice Selection</label>
                          <div className="grid grid-cols-2 gap-2">
                            {VOICES.map(v => (
                              <button
                                key={v.id}
                                onClick={() => { setVoice(v.id); stopAudio(); }}
                                className={`p-3 rounded-2xl text-left transition-all active:scale-95 border-2 ${
                                  voice === v.id 
                                    ? 'bg-indigo-50 border-indigo-600 dark:bg-indigo-900/20' 
                                    : 'bg-slate-50 border-transparent dark:bg-slate-800'
                                }`}
                              >
                                <p className={`text-xs font-bold ${voice === v.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{v.label}</p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-none mt-1">{v.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Playback Speed</label>
                          <div className="bg-slate-50 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                            {SPEEDS.map(s => (
                              <button
                                key={s}
                                onClick={() => setSpeed(s)}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${
                                  speed === s 
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                                    : 'text-slate-500'
                                }`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={() => setShowAudioSettings(false)}
                          className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                        >
                          Close Settings
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleListen}
                    disabled={isAudioLoading}
                    className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
                      isAudioLoading 
                        ? 'bg-indigo-400/30' 
                        : isPlaying 
                          ? 'bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                          : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {isAudioLoading ? (
                      <div className="flex gap-0.5 items-end justify-center h-4">
                        <div className="w-1 bg-white rounded-full animate-[audio-wave_0.8s_ease-in-out_infinite] h-2"></div>
                        <div className="w-1 bg-white rounded-full animate-[audio-wave_0.8s_ease-in-out_0.2s_infinite] h-3"></div>
                        <div className="w-1 bg-white rounded-full animate-[audio-wave_0.8s_ease-in-out_0.4s_infinite] h-1.5"></div>
                      </div>
                    ) : isPlaying ? (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="relative z-10"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      </div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                </div>
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

      <style>{`
        @keyframes audio-wave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </div>
  );
};

export default DevotionalView;
