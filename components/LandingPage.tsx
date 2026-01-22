import React, { useEffect, useRef } from 'react';
import { Logo, Card, Badge } from './Shared';

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0', 'scale-100');
          entry.target.classList.remove('opacity-0', 'translate-y-12', 'scale-95');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.scroll-animate').forEach(el => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden font-jakarta selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        </div>

        <div className="z-10 animate-in fade-in zoom-in duration-1000">
          <Logo size="lg" className="mb-12 mx-auto drop-shadow-2xl" />
        </div>
        
        <div className="z-10 space-y-6 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] animate-in slide-in-from-bottom-8 duration-700">
            Faith Meets <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic">Intelligence.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto animate-in slide-in-from-bottom-10 duration-700 [animation-delay:200ms]">
            Step into a new era of spiritual growth. GraceWalk combines timeless Biblical truth with modern AI to light your daily path.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in slide-in-from-bottom-12 duration-700 [animation-delay:400ms]">
            <button 
              onClick={onGetStarted}
              className="group relative px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">Get Started for Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-6 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-[2rem] font-bold text-lg hover:bg-slate-50 transition-all border border-slate-100 dark:border-slate-800"
            >
              See the Mission
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Scroll to Explore</span>
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 13 5 5 5-5"/></svg>
        </div>
      </section>

      {/* --- THE MISSION SECTION --- */}
      <section id="about" className="max-w-4xl mx-auto px-6 py-32 text-center">
        <div className="scroll-animate opacity-0 translate-y-12 transition-all duration-1000 space-y-8">
          <Badge color="slate">The Vision</Badge>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            We built GraceWalk to make the <span className="text-indigo-600">Sacred accessible</span> in a digital age.
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            In a world of noise, your spiritual life deserves a sanctuary. GraceWalk isn't just an app; it's a companion that grows with you, answering your questions, hearing your prayers, and keeping you grounded in the Word.
          </p>
        </div>
      </section>

      {/* --- FEATURE DEEP DIVES --- */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-60">
        
        {/* Feature 1: The Devotional Experience */}
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="scroll-animate opacity-0 translate-y-12 transition-all duration-1000 space-y-8">
            <Badge color="amber">Morning Ritual</Badge>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1]">
              Devotionals <br/>Built for <span className="italic">You.</span>
            </h2>
            <div className="space-y-6 text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              <p>
                Our AI analyzes thousands of scriptural commentaries and historical contexts to generate a fresh, youth-friendly devotional every morning.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-amber-100 text-amber-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><b>Personalized Tone:</b> Choose between gentle, deep, or practical guidance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-amber-100 text-amber-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><b>Search Grounded:</b> Ask for a devotional on specific topics like "anxiety" or "purpose."</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="relative scroll-animate opacity-0 translate-y-12 scale-95 transition-all duration-1000 delay-200">
            <div className="absolute -inset-4 bg-amber-500/20 rounded-[3rem] rotate-3 blur-3xl -z-10"></div>
            <Card className="p-0 overflow-hidden border-none shadow-2xl">
               <div className="bg-amber-500 p-8 text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Today's Focus</span>
                  <p className="text-2xl font-serif italic mt-2">"For God has not given us a spirit of fear, but of power and of love and of a sound mind."</p>
                  <p className="mt-4 text-xs font-bold opacity-60">2 Timothy 1:7 • NIV</p>
               </div>
               <div className="p-8 bg-white dark:bg-slate-900 space-y-4">
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <div className="h-4 w-4/6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
               </div>
            </Card>
          </div>
        </div>

        {/* Feature 2: Bible Buddy AI */}
        <div className="grid lg:grid-cols-2 gap-20 items-center lg:flex-row-reverse">
          <div className="lg:order-2 scroll-animate opacity-0 translate-y-12 transition-all duration-1000 space-y-8">
            <Badge color="indigo">The Bible Buddy</Badge>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1]">
              Clarity on <br/>Any Verse.
            </h2>
            <div className="space-y-6 text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              <p>
                Ever read a verse and felt lost? Bible Buddy is your 24/7 mentor. It doesn't just give answers; it provides historical context and practical applications.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl">
                   <p className="text-indigo-600 dark:text-indigo-400 font-bold text-2xl mb-1">66</p>
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Books Mastered</p>
                </div>
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl">
                   <p className="text-indigo-600 dark:text-indigo-400 font-bold text-2xl mb-1">∞</p>
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Zero Judgment</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:order-1 relative scroll-animate opacity-0 translate-y-12 scale-95 transition-all duration-1000 delay-200">
             <div className="absolute -inset-4 bg-indigo-500/20 rounded-[3rem] -rotate-3 blur-3xl -z-10"></div>
             <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl space-y-6">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-indigo-500 shrink-0"></div>
                   <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none text-sm">
                      What does the Greek word 'Agape' really mean?
                   </div>
                </div>
                <div className="flex justify-end gap-3">
                   <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed max-w-[80%]">
                      Great question! Agape represents the highest form of love—unconditional, sacrificial, and divine. In the New Testament, it describes God's love for humanity...
                   </div>
                   <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">GW</div>
                </div>
             </div>
          </div>
        </div>

        {/* Feature 3: Community & Stories - UPDATED WITH USER REQUESTED IMAGES */}
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="scroll-animate opacity-0 translate-y-12 transition-all duration-1000 space-y-8">
            <Badge color="emerald">The Sanctuary</Badge>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1]">
              A Prayer <br/>Wall that <span className="italic">Breathes.</span>
            </h2>
            <div className="space-y-6 text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              <p>
                Prayer is powerful, but it’s even stronger when shared. Join a living community where you can post requests and see real-time encouragement from around the world.
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="" />
                      </div>
                    ))}
                 </div>
                 <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Join 10k+ Praying Members</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 relative">
             {/* Miracle Card */}
             <div className="h-[420px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] relative overflow-hidden shadow-2xl scroll-animate opacity-0 translate-y-12 scale-95 transition-all duration-1000 delay-100">
                <img 
                  src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1031&auto=format&fit=crop" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Sunrise"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-6 left-6">
                   <span className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">MIRACLE</span>
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                   <p className="text-white text-sm font-bold leading-relaxed drop-shadow-lg italic">"My surgery was successful! God is good!"</p>
                </div>
             </div>

             {/* Need Card */}
             <div className="h-[420px] bg-slate-200 dark:bg-slate-700 rounded-[2.5rem] mt-16 relative overflow-hidden shadow-2xl scroll-animate opacity-0 translate-y-12 scale-95 transition-all duration-1000 delay-300">
                <img 
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1073&auto=format&fit=crop" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Studying"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-6 left-6">
                   <span className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">NEED</span>
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                   <p className="text-white text-sm font-bold leading-relaxed drop-shadow-lg italic">"Please pray for my final exams next week."</p>
                </div>
             </div>
          </div>
        </div>

      </section>

      {/* --- HOW IT WORKS (Timeline) --- */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 scroll-animate opacity-0 translate-y-12 transition-all duration-1000">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Begin Your Journey</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-4">Three simple steps to a deeper faith.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Claim Your Spot", desc: "Create your unique profile and set your spiritual preferences (translation & tone)." },
              { step: "02", title: "Discover Daily", desc: "Wake up to a fresh devotional and a Bible Buddy ready to answer your questions." },
              { step: "03", title: "Connect & Grow", desc: "Share your own stories and join the global community in uplifting prayer." }
            ].map((item, i) => (
              <div key={i} className="scroll-animate opacity-0 translate-y-12 transition-all duration-1000 delay-[200ms]" style={{ transitionDelay: `${i * 200}ms` }}>
                <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 h-full">
                  <span className="text-5xl font-black text-indigo-100 dark:text-slate-800 mb-6 block">{item.step}</span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS / SOCIAL PROOF --- */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center scroll-animate opacity-0 translate-y-12 transition-all duration-1000">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div>
                 <p className="text-5xl font-black text-indigo-600 mb-2">1M+</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Prayers Shared</p>
              </div>
              <div>
                 <p className="text-5xl font-black text-purple-600 mb-2">4.9</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">App Rating</p>
              </div>
              <div>
                 <p className="text-5xl font-black text-amber-600 mb-2">150+</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bible Versions</p>
              </div>
              <div>
                 <p className="text-5xl font-black text-emerald-600 mb-2">24/7</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AI Assistance</p>
              </div>
           </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-40 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 -z-10 rotate-3 scale-110"></div>
        <div className="max-w-3xl mx-auto scroll-animate opacity-0 translate-y-12 transition-all duration-1000 text-white">
          <Logo size="md" className="mx-auto mb-12 bg-white rounded-full p-2" />
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Your spiritual path is <br/>calling.</h2>
          <p className="text-xl md:text-2xl text-indigo-100 mb-12 font-medium opacity-80">Join a community dedicated to growing together in the grace and knowledge of our Lord.</p>
          <button 
            onClick={onGetStarted}
            className="px-16 py-8 bg-white text-indigo-600 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all active:scale-95"
          >
            Start Your Free Journey
          </button>
          <p className="mt-8 text-indigo-200 text-sm font-bold uppercase tracking-widest opacity-60">No Credit Card Required • Peace Guaranteed</p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo size="sm" />
          <div className="flex gap-8 text-sm font-bold text-slate-400">
             <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Donate</a>
          </div>
          <p className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">GraceWalk © 2025 • Walking in Light</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;