
import React, { useState, useEffect } from 'react';
import DevotionalView from './components/DevotionalView';
import PrayerWall from './components/PrayerWall';
import AskBible from './components/AskBible';
import BibleView from './components/BibleView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import { Logo } from './components/Shared';
import { AppTab, UserProfile } from './types';
import { supabaseService } from './services/supabaseService';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('devotional');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [initialAsk, setInitialAsk] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      supabaseService.getProfile().then(setProfile);
    }
  }, [activeTab, session]);

  const handleAskBuddy = (context: string) => {
    setInitialAsk(context);
    setActiveTab('ask');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="w-8 h-8 border-[3px] border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!session) {
    if (showAuth) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowAuth(false)}
            className="fixed top-8 left-6 z-50 p-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full shadow-lg border border-slate-100 dark:border-slate-800 text-indigo-600 active:scale-90 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <Auth />
        </div>
      );
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex flex-col font-inter selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-500">
      <header className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-slate-200/40 dark:border-slate-800/40 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center group cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab('devotional')}>
            <Logo size="sm" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><path d="M12 2c0 10.5 4 12 4 12s1.5-1.5 1.5-5.5c4 4.5 1.5 13-5.5 13s-8-6-4-12c.5-1.5.5-2.5 0-4.5 0 0 4 3 4 7z"/></svg>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile?.streak || 0}</span>
            </div>
            {profile && (
              <button onClick={() => setActiveTab('profile')} className="w-9 h-9 rounded-full border border-white/50 dark:border-slate-700/50 shadow-md overflow-hidden active:scale-90 transition-transform">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`} alt="Avatar" />
              </button>
            )}
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-1.5 rounded-full transition-all active:scale-90 ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 max-w-2xl mx-auto w-full">
        <div className="pb-32">
          {activeTab === 'devotional' && <DevotionalView />}
          {activeTab === 'prayer' && <PrayerWall />}
          {activeTab === 'bible' && <BibleView onAskBuddy={handleAskBuddy} />}
          {activeTab === 'ask' && <AskBible initialPrompt={initialAsk} clearPrompt={() => setInitialAsk(null)} />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-t border-slate-200/50 dark:border-slate-800/50 px-8 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <TabButton active={activeTab === 'devotional'} onClick={() => setActiveTab('devotional')} label="Home" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
          <TabButton active={activeTab === 'bible'} onClick={() => setActiveTab('bible')} label="Bible" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 6h10"/><path d="M8 10h10"/><path d="M8 14h10"/></svg>} />
          <TabButton active={activeTab === 'prayer'} onClick={() => setActiveTab('prayer')} label="Pray" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.046 3 5.5L12 21l7-7Z"/></svg>} />
          <TabButton active={activeTab === 'ask'} onClick={() => setActiveTab('ask')} label="Ask" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="Me" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
        </div>
      </nav>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all relative group ui-select-none active:scale-90 ${active ? 'text-indigo-600' : 'text-slate-400'}`}
  >
    <div className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold tracking-tight transition-opacity ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </button>
);

export default App;
