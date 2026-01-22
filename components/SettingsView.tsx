
import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Badge } from './Shared';
import { BibleTranslation, AITone } from '../types';

const SettingsView: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [translation, setTranslation] = useState<BibleTranslation>(() => (localStorage.getItem('bible_translation') as BibleTranslation) || 'NIV');
  const [tone, setTone] = useState<AITone>(() => (localStorage.getItem('ai_tone') as AITone) || 'gentle');
  const [reminderTime, setReminderTime] = useState(localStorage.getItem('reminder_time') || '08:00');
  const [remindersEnabled, setRemindersEnabled] = useState(localStorage.getItem('reminders_enabled') === 'true');

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    localStorage.setItem('bible_translation', translation);
  }, [translation]);

  useEffect(() => {
    localStorage.setItem('ai_tone', tone);
  }, [tone]);

  useEffect(() => {
    localStorage.setItem('reminder_time', reminderTime);
    localStorage.setItem('reminders_enabled', String(remindersEnabled));
  }, [reminderTime, remindersEnabled]);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      <SectionTitle 
        title="Settings" 
        subtitle="Manage your spiritual space."
      />

      {/* PWA / Install Section - Helpful for students without Play Store access */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">APP EXPERIENCE</h4>
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <Badge color="yellow">Tip</Badge>
            <h3 className="text-xl font-bold leading-tight">Add to Home Screen</h3>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed">
              Enjoy GraceWalk like a real app! Tap your browser's <span className="font-bold underline">Share</span> button and select <span className="font-bold underline">"Add to Home Screen"</span>.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </Card>
      </div>

      {/* General Settings Group */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">PREFERENCES</h4>
        <Card className="p-0 overflow-hidden dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Dark Mode Row */}
            <div className="flex items-center justify-between p-4 px-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {darkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
                  )}
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Appearance</span>
              </div>
              <button 
                onClick={toggleTheme}
                className={`w-12 h-7 rounded-full relative transition-colors duration-300 active:scale-95 ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-5.5' : 'translate-x-0.5'}`}></div>
              </button>
            </div>

            {/* Translation Row */}
            <div className="p-4 px-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 text-white rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Translation</span>
              </div>
              <div className="bg-slate-50 dark:bg-black/50 p-1 rounded-xl flex gap-1">
                {(['NIV', 'KJV', 'ESV', 'NLT'] as BibleTranslation[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTranslation(t)}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all active:scale-95 ${
                      translation === t 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                      : 'text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Focus Settings Group */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">AI SPIRITUAL FOCUS</h4>
        <Card className="p-0 overflow-hidden dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(['gentle', 'deep', 'practical'] as AITone[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className="w-full flex items-center justify-between p-4 px-6 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {t === 'gentle' ? 'Encouraging' : t === 'deep' ? 'Deep Insight' : 'Practical Living'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-tight">
                    {t === 'gentle' ? 'Peace & Comfort' : t === 'deep' ? 'History & Context' : 'Actionable Advice'}
                  </p>
                </div>
                {tone === t && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Notifications Group */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">SYSTEM</h4>
        <Card className="p-0 overflow-hidden dark:bg-slate-900">
          <div className="p-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500 text-white rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Daily Notifications</span>
            </div>
            <button 
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              className={`w-12 h-7 rounded-full relative transition-colors duration-300 active:scale-95 ${remindersEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${remindersEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
          {remindersEnabled && (
             <div className="p-4 px-6 bg-slate-50 dark:bg-black/20 flex items-center justify-between animate-in slide-in-from-top-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bread Time</span>
                <input 
                  type="time" 
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-indigo-600 font-bold text-sm"
                />
             </div>
          )}
        </Card>
      </div>

      <div className="pt-10 text-center">
        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">GraceWalk OS v1.2</p>
      </div>
    </div>
  );
};

export default SettingsView;
