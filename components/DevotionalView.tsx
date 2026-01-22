import React, { useState, useEffect } from 'react';
import { Devotional } from '../types';
import { generateDailyDevotional, getSearchGroundedDevotional } from '../services/geminiService';
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

  const fetchDevo = async (topicId: string) => {
    setLoading(true);
    setIsSaved(false);
    try {
      let data;
      if (topicId === 'daily') {
        data = await generateDailyDevotional();
      } else {
        const topic = TOPICS.find(t => t.id === topicId)?.label || topicId;
        data = await getSearchGroundedDevotional(topic);
      }
      setDevotional(data);
      await supabaseService.updateStats('devo');
    } catch (error) {
      console.error("Error fetching devotional:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevo('daily');
  }, []);

  const handleSaveVerse = async () => {
    if (!devotional || isSaved) return;
    await supabaseService.saveVerse(devotional.verse, devotional.reference);
    setIsSaved(true);
  };

  if (loading) return <Loader />;
  if (!devotional) return <div className="p-8 text-center text-slate-500 font-jakarta font-medium">No connection.</div>;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <SectionTitle 
        title={activeTopic === 'daily' ? "Daily Bread" : devotional.title} 
        subtitle={devotional.date} 
      />

      {/* iOS Segmented Control Style Topics */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => {
              setActiveTopic(topic.id);
              fetchDevo(topic.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-bold text-sm transition-all active:scale-95 ${
              activeTopic === topic.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
              : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-500 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50'
            }`}
          >
            <span>{topic.icon}</span>
            {topic.label}
          </button>
        ))}
      </div>

      {/* Featured Verse Card - iOS Style */}
      <div className="relative group">
        <Card className="relative overflow-hidden border-none shadow-[0_20px_40px_rgba(79,70,229,0.15)] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white min-h-[300px] flex flex-col justify-end p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <button 
            onClick={handleSaveVerse}
            className={`absolute top-6 right-6 p-3 rounded-full transition-all active:scale-90 ${isSaved ? 'bg-rose-500 text-white' : 'bg-white/10 backdrop-blur-xl text-white hover:bg-white/20'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.046 3 5.5L12 21l7-7Z"/></svg>
          </button>

          <div className="relative z-10 space-y-4">
            <Badge color="yellow">{activeTopic === 'daily' ? 'VERSE OF THE DAY' : 'SCRIPTURE'}</Badge>
            <p className="text-2xl md:text-3xl font-bold tracking-tight leading-tight italic">
              "{devotional.verse}"
            </p>
            <p className="font-bold text-indigo-200 text-sm tracking-widest uppercase">
              — {devotional.reference}
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="px-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            {activeTopic === 'daily' ? devotional.title : "Spiritual Reflection"}
          </h2>
          <div className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed space-y-4 font-medium">
            {devotional.reflection}
          </div>

          {devotional.sources && devotional.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">RESOURCES</h4>
              <div className="flex flex-wrap gap-2">
                {devotional.sources.map((source, idx) => (
                  <a 
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold active:scale-95 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reflection Card */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 mb-2 px-2">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">PONDER</h3>
          </div>
          <Card className="bg-white/80 dark:bg-slate-900/60 shadow-lg shadow-indigo-100/10">
            <p className="text-slate-900 dark:text-white font-bold text-lg leading-snug">
              {devotional.reflectionQuestion}
            </p>
          </Card>
        </div>

        {/* Short Prayer Area */}
        <div className="relative py-12 px-8 rounded-[2.5rem] bg-indigo-50/40 dark:bg-indigo-900/10 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-5-5-5-9-5-12s2-5 5-5 5 2 5 5-5 7-5 12z"/></svg>
          </div>
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">PRAYER</h3>
          <p className="text-indigo-900 dark:text-indigo-200 text-xl font-bold tracking-tight italic">
            "{devotional.shortPrayer}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevotionalView;