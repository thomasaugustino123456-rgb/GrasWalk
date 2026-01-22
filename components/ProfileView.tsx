
import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { Card, Badge, SectionTitle, Loader } from './Shared';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../services/supabaseClient';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await supabaseService.getProfile();
      setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <Loader />;
  if (!profile) return null;

  const streakMilestones = [
    { label: "3 Days", days: 3 },
    { label: "7 Days", days: 7 },
    { label: "14 Days", days: 14 },
    { label: "30 Days", days: 30 },
  ];

  return (
    <div className="space-y-8 pb-32 max-w-2xl mx-auto animate-in fade-in duration-500 px-1">
      <SectionTitle title="Your Journey" />

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-[2.5rem] rotate-6 opacity-10"></div>
          <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`} 
              alt="Avatar"
              className="w-full h-full object-cover rounded-[2.3rem] bg-white dark:bg-slate-800"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2.5 rounded-2xl shadow-lg ring-4 ring-white dark:ring-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-jakarta font-extrabold text-slate-900 dark:text-white">{profile.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Faithful since {profile.joinedDate}
          </p>
        </div>
      </div>

      {/* Streak Section */}
      <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-none shadow-xl shadow-amber-100 dark:shadow-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Current Streak</span>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-jakarta font-black">{profile.streak}</span>
              <span className="text-xl font-bold opacity-90">Days</span>
            </div>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-pulse shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 10.5 4 12 4 12s1.5-1.5 1.5-5.5c4 4.5 1.5 13-5.5 13s-8-6-4-12c.5-1.5.5-2.5 0-4.5 0 0 4 3 4 7z"/></svg>
          </div>
        </div>
      </Card>

      {/* Prayers Supported Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Prayers Supported</h3>
          <Badge color="amber">Support List</Badge>
        </div>
        
        {profile.supportedPrayers && profile.supportedPrayers.length > 0 ? (
          <div className="space-y-4">
            {profile.supportedPrayers.map((p) => (
              <Card key={p.id} className="border-l-4 border-l-amber-400 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{p.author}</span>
                   <span className="text-[10px] text-slate-400 uppercase font-bold">• {new Date(p.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">"{p.content}"</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-800 text-center py-10 opacity-60">
            <p className="text-slate-400 dark:text-slate-500 font-medium">Click "Pray" on others' posts to save them here.</p>
          </Card>
        )}
      </div>

      {/* Saved Verses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Treasured Words</h3>
          <Badge color="rose">{profile.savedVerses.length} Saved</Badge>
        </div>
        
        {profile.savedVerses.length > 0 ? (
          <div className="space-y-4">
            {profile.savedVerses.map((v) => (
              <Card key={v.id} className="border-l-4 border-l-rose-400 py-4 hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800">
                <p className="text-slate-700 dark:text-slate-300 italic font-serif text-lg leading-relaxed mb-2">"{v.verse}"</p>
                <p className="text-xs font-bold text-rose-50 uppercase tracking-widest">— {v.reference}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-800 text-center py-10 opacity-60">
            <p className="text-slate-400 dark:text-slate-500 font-medium">Heart a verse in Daily Bread to see it here.</p>
          </Card>
        )}
      </div>

      <div className="pt-4 pb-8">
        <button 
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all border border-rose-100 dark:border-rose-500/30"
        >
          Logout from GraceWalk
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
