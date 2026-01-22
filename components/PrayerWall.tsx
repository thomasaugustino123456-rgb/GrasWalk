import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Prayer, PrayerComment, Story } from '../types';
import { Card, Badge, SectionTitle, Loader } from './Shared';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../services/supabaseClient';

const PrayerWall: React.FC = () => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPrayer, setNewPrayer] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [newPostAlert, setNewPostAlert] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  
  // Custom confirmation state (iOS Action Sheet style)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'prayer' | 'story' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
    const [prayerData, storyData] = await Promise.all([
      supabaseService.fetchPrayers(),
      supabaseService.fetchStories()
    ]);
    setPrayers(prayerData);
    setStories(storyData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const prayerSubscription = supabase
      .channel('global-prayers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayers' }, async (payload) => {
        const newPost = payload.new;
        const { data: { user } } = await supabase.auth.getUser();
        if (newPost.user_id !== user?.id) {
          setNewPostAlert(`${newPost.is_anonymous ? 'Someone' : newPost.author} shared a prayer.`);
          setTimeout(() => setNewPostAlert(null), 5000);
        }
        setPrayers(prev => [newPost as any, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'prayers' }, (payload) => {
        setPrayers(prev => prev.map(p => p.id === payload.new.id ? { ...p, prayers_count: payload.new.prayers_count } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'prayers' }, (payload) => {
        setPrayers(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe((status) => setIsLive(status === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(prayerSubscription); };
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('name').single();
      await supabaseService.addPrayer(newPrayer, profile?.name || "Member", isAnon);
      setNewPrayer('');
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsPosting(false); 
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingStory(true);
    try { 
      await supabaseService.uploadStory(file);
      const updatedStories = await supabaseService.fetchStories();
      setStories(updatedStories);
    } catch (error: any) { 
      console.error(error);
      alert(`Upload Error: ${error.message}\n\nHint: Check your Supabase Dashboard -> Storage -> Policies. You must have an 'INSERT' policy for authenticated users on the 'stories' bucket.`);
    } finally { 
      setIsUploadingStory(false); 
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processDeletion = async () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;
    
    try {
      if (type === 'prayer') {
        const success = await supabaseService.deletePrayer(id);
        if (success) {
          setPrayers(prev => prev.filter(p => p.id !== id));
        } else {
          alert("Could not delete. Check your Supabase RLS 'DELETE' policy for the 'prayers' table.");
        }
      } else {
        const success = await supabaseService.deleteStory(id);
        if (success) {
          setStories(prev => prev.filter(s => s.id !== id));
        } else {
          alert("Could not delete. Check your Supabase RLS 'DELETE' policy for the 'stories' table.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred during deletion.");
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* iOS Action Sheet / Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm space-y-2 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 text-center border-b border-slate-200/50 dark:border-slate-800/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirmation</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  Are you sure you want to delete this {confirmDelete.type}?
                </p>
              </div>
              <button 
                onClick={processDeletion}
                className="w-full py-4 text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors active:bg-rose-100"
              >
                Delete {confirmDelete.type === 'prayer' ? 'Prayer' : 'Story'}
              </button>
            </div>
            <button 
              onClick={() => setConfirmDelete(null)}
              className="w-full py-4 bg-white dark:bg-slate-900 rounded-2xl font-bold text-slate-900 dark:text-white shadow-xl active:scale-[0.98] transition-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {newPostAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-indigo-600/90 backdrop-blur-xl text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold">{newPostAlert}</span>
          </div>
        </div>
      )}

      {/* iOS Story Bar */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-4 px-6">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 flex flex-col items-center gap-2 group"
        >
          <div className="w-16 h-16 rounded-[1.4rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center relative shadow-sm active:scale-90 transition-transform">
             {isUploadingStory ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : (
               <div className="text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
               </div>
             )}
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Post</span>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
        </button>

        {stories.map((story, idx) => (
          <div key={story.id} className="relative shrink-0 flex flex-col items-center gap-2">
            <button 
              onClick={() => setActiveStoryIndex(idx)}
              className="group active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-[1.4rem] bg-indigo-100 p-0.5 border-2 border-indigo-600 overflow-hidden shadow-md">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.avatar_seed || story.user_id}`} className="w-full h-full object-cover rounded-[1.2rem] bg-white" alt="" />
              </div>
            </button>
            <span className="text-[10px] font-bold text-slate-500 truncate w-16 text-center">{story.author.split(' ')[0]}</span>
            
            {story.user_id === currentUserId && (
              <button 
                onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: story.id, type: 'story' }); }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-75 transition-transform z-[40]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between px-1">
        <SectionTitle title="The Sanctuary" subtitle="Support your community in prayer." />
        {isLive && (
          <div className="mb-6 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-emerald-600 uppercase">Live</span>
          </div>
        )}
      </div>

      {/* Add Prayer Card */}
      <Card className="p-0 overflow-hidden ring-4 ring-slate-100 dark:ring-slate-900/50">
        <form onSubmit={handleSubmit}>
          <textarea
            value={newPrayer}
            onChange={(e) => setNewPrayer(e.target.value)}
            placeholder="Share a request..."
            className="w-full min-h-[100px] p-6 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
          />
          <div className="flex items-center justify-between p-4 px-6 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-800">
             <button 
                type="button" 
                onClick={() => setIsAnon(!isAnon)}
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${isAnon ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
             >
               {isAnon ? 'Anonymous' : 'Public'}
             </button>
             <button 
                type="submit"
                disabled={!newPrayer.trim() || isPosting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
             >
                {isPosting ? '...' : 'Share'}
             </button>
          </div>
        </form>
      </Card>

      {/* Feed */}
      <div className="space-y-4 pt-4">
        {prayers.map(prayer => (
          <Card key={prayer.id} className="relative active:scale-[0.99] transition-transform">
             {prayer.user_id === currentUserId && (
               <button 
                 type="button"
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete({ id: prayer.id, type: 'prayer' }); }}
                 className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-colors z-[40]"
                 title="Delete prayer"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
               </button>
             )}
             <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[0.8rem] bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {prayer.is_anonymous ? '?' : prayer.author[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-none">{prayer.author}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(prayer.timestamp).toLocaleDateString()}</p>
                  </div>
               </div>
             </div>
             <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-4 pr-12">{prayer.content}</p>
             <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <button 
                  onClick={() => supabaseService.toggleSupport(prayer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-90 ${prayer.has_supported ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-slate-50 text-slate-500 dark:bg-slate-800'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={prayer.has_supported ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.046 3 5.5L12 21l7-7Z"/></svg>
                  {prayer.prayers_count}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800 font-bold text-xs active:scale-90 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {prayer.comment_count || 0}
                </button>
             </div>
          </Card>
        ))}
      </div>

      {/* Story Viewer (minimalist iOS style) */}
      {activeStoryIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-300">
           <div className="h-full flex flex-col max-w-lg mx-auto relative">
              <div className="absolute top-10 inset-x-6 z-20 flex flex-col gap-4">
                 <div className="flex gap-1 h-0.5">
                    {stories.map((_, i) => (
                      <div key={i} className="flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div className={`h-full bg-white ${i < activeStoryIndex ? 'w-full' : i === activeStoryIndex ? 'animate-[progress_7s_linear_forwards]' : 'w-0'}`}></div>
                      </div>
                    ))}
                 </div>
                 <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full border-2 border-white/50 p-0.5 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stories[activeStoryIndex].avatar_seed}`} className="w-full h-full rounded-full" />
                       </div>
                       <span className="font-bold text-sm">{stories[activeStoryIndex].author}</span>
                    </div>
                    <button onClick={() => setActiveStoryIndex(null)} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                 </div>
              </div>
              <div className="flex-1 bg-black flex items-center justify-center">
                 {stories[activeStoryIndex].media_type === 'video' ? (
                   <video src={stories[activeStoryIndex].media_url} autoPlay playsInline muted className="max-h-full w-full object-contain" />
                 ) : (
                   <img src={stories[activeStoryIndex].media_url} className="max-h-full w-full object-contain" />
                 )}
              </div>
              <div className="absolute inset-y-0 left-0 w-1/4" onClick={() => setActiveStoryIndex(Math.max(0, activeStoryIndex - 1))}></div>
              <div className="absolute inset-y-0 right-0 w-1/4" onClick={() => { if (activeStoryIndex < stories.length - 1) setActiveStoryIndex(activeStoryIndex + 1); else setActiveStoryIndex(null); }}></div>
           </div>
           <style>{`
             @keyframes progress { from { width: 0%; } to { width: 100%; } }
           `}</style>
        </div>
      )}
    </div>
  );
};

export default PrayerWall;