import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { Card, Badge, SectionTitle, Loader } from './Shared';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../services/supabaseClient';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAvatarSeed, setEditAvatarSeed] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    const data = await supabaseService.getProfile();
    if (data) {
      setProfile(data);
      setEditName(data.name);
      setEditAvatarSeed(data.avatarSeed);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleShuffleAvatar = () => {
    setEditAvatarSeed(Math.random().toString(36).substring(7));
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert("Please enter a name");
      return;
    }
    setSaving(true);
    const success = await supabaseService.updateProfile({
      name: editName,
      avatar_seed: editAvatarSeed
    });
    
    if (success) {
      await loadProfile();
      setIsEditing(false);
    } else {
      alert("Failed to update profile. Please try again.");
    }
    setSaving(false);
  };

  if (loading) return <Loader />;
  if (!profile) return null;

  return (
    <div className="space-y-8 pb-32 max-w-2xl mx-auto animate-in fade-in duration-500 px-1">
      <div className="flex items-center justify-between">
        <SectionTitle title="Your Journey" />
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2.5 bg-white dark:bg-slate-900 rounded-full shadow-md border border-slate-100 dark:border-slate-800 text-indigo-600 active:scale-90 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500 rounded-[2.5rem] rotate-6 opacity-10"></div>
          <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${isEditing ? editAvatarSeed : profile.avatarSeed}`} 
              alt="Avatar"
              className="w-full h-full object-cover rounded-[2.3rem] bg-white dark:bg-slate-800 transition-all"
            />
            {isEditing && (
              <button 
                onClick={handleShuffleAvatar}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              </button>
            )}
          </div>
          {isEditing ? (
             <button 
              onClick={handleShuffleAvatar}
              className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg ring-4 ring-white dark:ring-slate-900 active:scale-90 transition-transform"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h2c1.1 0 2-0.9 2-2V8c0-1.1 0.9-2 2-2h1c1.1 0 2 0.9 2 2v8c0 1.1 0.9 2 2 2h2"/><path d="M22 6h-2c-1.1 0-2 0.9-2 2v8c0 1.1-0.9 2-2 2h-1c-1.1 0-2-0.9-2-2V8c0-1.1-0.9-2-2-2H9"/></svg>
             </button>
          ) : (
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2.5 rounded-2xl shadow-lg ring-4 ring-white dark:ring-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="w-full max-w-xs space-y-4 animate-in slide-in-from-top-4 duration-500">
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Display Name"
              className="w-full text-center px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-indigo-500 font-bold text-slate-900 dark:text-white"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? '...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-jakarta font-extrabold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Faithful since {profile.joinedDate}
            </p>
          </div>
        )}
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