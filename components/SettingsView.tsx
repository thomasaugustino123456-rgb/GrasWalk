
import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Badge } from './Shared';
import { BibleTranslation, AITone } from '../types';
import { supabase } from '../services/supabaseClient';

const DEFAULT_TEMPLATES = {
  whatsapp: `Hey! I've been working on a student project called GraceWalk. It's an AI Bible companion I built for our generation. Check it out here: ${window.location.origin}`,
  discord: `**GraceWalk - Student AI Project** 🕊️\nI built a clean, AI-powered Bible buddy for my daily walk. No ads, just the Word. \nCheck it out: ${window.location.origin}`,
  reddit_comment: `I actually felt the same way, so I spent my time in school building a free tool called GraceWalk. It uses AI to explain verses simply. Hope it helps you! ${window.location.origin}`
};

const SettingsView: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [translation, setTranslation] = useState<BibleTranslation>(() => (localStorage.getItem('bible_translation') as BibleTranslation) || 'NIV');
  const [tone, setTone] = useState<AITone>(() => (localStorage.getItem('ai_tone') as AITone) || 'gentle');
  const [reminderTime, setReminderTime] = useState(localStorage.getItem('reminder_time') || '08:00');
  const [remindersEnabled, setRemindersEnabled] = useState(localStorage.getItem('reminders_enabled') === 'true');
  const [isEditingTemplates, setIsEditingTemplates] = useState(false);

  // Custom Templates state
  const [customTemplates, setCustomTemplates] = useState(() => {
    const saved = localStorage.getItem('custom_share_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

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

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${platform} template! Use this to share naturally.`);
  };

  const handleTemplateChange = (platform: keyof typeof DEFAULT_TEMPLATES, value: string) => {
    setCustomTemplates((prev: any) => ({
      ...prev,
      [platform]: value
    }));
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

  useEffect(() => {
    localStorage.setItem('custom_share_templates', JSON.stringify(customTemplates));
  }, [customTemplates]);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      <SectionTitle 
        title="Settings" 
        subtitle="Manage your spiritual space."
      />

      {/* Share Hub - The "Safety" Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-4">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">SHARE THE LIGHT</h4>
          <button 
            onClick={() => setIsEditingTemplates(!isEditingTemplates)}
            className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            {isEditingTemplates ? 'Done Editing' : 'Edit Templates'}
          </button>
        </div>
        
        <Card className="bg-indigo-600 p-6 shadow-xl relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
               <Badge color="yellow">Outreach Hub</Badge>
               <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Student Builder v1.2</span>
            </div>
            <h3 className="text-xl font-bold text-white leading-tight">Help GraceWalk Grow</h3>
            
            {isEditingTemplates ? (
              <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">WhatsApp Message</label>
                  <textarea 
                    value={customTemplates.whatsapp}
                    onChange={(e) => handleTemplateChange('whatsapp', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none min-h-[80px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Discord Message</label>
                  <textarea 
                    value={customTemplates.discord}
                    onChange={(e) => handleTemplateChange('discord', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none min-h-[80px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Reddit Comment</label>
                  <textarea 
                    value={customTemplates.reddit_comment}
                    onChange={(e) => handleTemplateChange('reddit_comment', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none min-h-[80px]"
                  />
                </div>
                <button 
                  onClick={() => {
                    setCustomTemplates(DEFAULT_TEMPLATES);
                    alert("Templates reset to defaults.");
                  }}
                  className="w-full py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] hover:text-white/80 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            ) : (
              <>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                  Sharing your work is how the light spreads. Use these templates to invite others to the journey without sounding like an ad.
                </p>
                <div className="grid grid-cols-1 gap-2 pt-2">
                   <button 
                     onClick={() => copyToClipboard(customTemplates.whatsapp, 'WhatsApp')}
                     className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all active:scale-95"
                   >
                     <span className="font-bold text-white text-sm">WhatsApp Friend</span>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/></svg>
                   </button>
                   <button 
                     onClick={() => copyToClipboard(customTemplates.discord, 'Discord')}
                     className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all active:scale-95"
                   >
                     <span className="font-bold text-white text-sm">Discord Community</span>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/></svg>
                   </button>
                   <button 
                     onClick={() => copyToClipboard(customTemplates.reddit_comment, 'Reddit')}
                     className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all active:scale-95"
                   >
                     <span className="font-bold text-white text-sm">Helpful Reddit Comment</span>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                   </button>
                </div>
              </>
            )}
            
            <div className="pt-2">
               <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                  <p className="text-[10px] text-indigo-200 font-bold italic">
                    "Do not let your hearts be troubled. You believe in God; believe also in me." — John 14:1
                  </p>
               </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
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

      {/* App Installation Tip */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">WEB APP SETUP</h4>
        <Card className="bg-slate-50 dark:bg-slate-900/40 border-dashed border-2 border-slate-200 dark:border-slate-800 p-6">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Save to Home Screen</h3>
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
             Because this is a student project, you don't need the App Store. Tap your browser's share icon and choose <span className="text-indigo-600 font-bold">"Add to Home Screen"</span> to use it full-screen.
           </p>
        </Card>
      </div>

      <div className="pt-10 text-center pb-20">
        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">GraceWalk OS v1.2</p>
        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-2">Built by a student in faith.</p>
      </div>
    </div>
  );
};

export default SettingsView;
