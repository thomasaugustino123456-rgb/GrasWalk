import React from 'react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className = "" }) => {
  const sizes = {
    sm: { container: 'w-10 h-10', g: 'text-4xl', text: 'text-[4px] tracking-[0.2em]', pad: 'px-1 py-0.5' },
    md: { container: 'w-16 h-16', g: 'text-6xl', text: 'text-[6px] tracking-[0.25em]', pad: 'px-2 py-1' },
    lg: { container: 'w-24 h-24', g: 'text-[120px]', text: 'text-[10px] tracking-[0.3em]', pad: 'px-4 py-2' }
  };
  const config = sizes[size];

  return (
    <div className={`relative flex items-center justify-center select-none group ${config.container} ${className}`}>
      <span className={`font-serif font-light leading-none text-slate-900 dark:text-white transition-all duration-700 group-hover:scale-105 ${config.g}`}>
        G
      </span>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-md ${config.pad} border-y border-slate-200/50 dark:border-slate-800/50 z-10 whitespace-nowrap rounded-sm`}>
        <span className={`font-jakarta font-black uppercase text-slate-950 dark:text-white ${config.text}`}>
          GraceWalk
        </span>
      </div>
    </div>
  );
};

export const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-in fade-in duration-500">
    <div className="relative w-8 h-8">
      {[...Array(8)].map((_, i) => (
        <div 
          key={i} 
          className="absolute w-1.5 h-3 bg-slate-300 dark:bg-slate-700 rounded-full left-[13px] top-0 origin-[4px_16px]"
          style={{ transform: `rotate(${i * 45}deg)`, animation: `fade 0.8s linear ${i * 0.1}s infinite` }}
        ></div>
      ))}
    </div>
    <p className="text-slate-400 dark:text-slate-500 font-semibold text-sm tracking-tight">Updating...</p>
    <style>{`
      @keyframes fade {
        0% { opacity: 1; background: #6366f1; }
        100% { opacity: 0.2; }
      }
    `}</style>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ children, className = "", noPadding = false }) => (
  <div className={`bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.2rem] border border-white/40 dark:border-slate-800/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none ${noPadding ? '' : 'p-6'} ios-transition ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'indigo' | 'amber' | 'emerald' | 'rose' | 'slate' | 'yellow' }> = ({ children, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50/50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    amber: "bg-amber-50/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    emerald: "bg-emerald-50/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    rose: "bg-rose-50/50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    slate: "bg-slate-100/50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400",
    yellow: "bg-yellow-50/50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${colors[color]}`}>
      {children}
    </span>
  );
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string; large?: boolean }> = ({ title, subtitle, large = false }) => (
  <div className="mb-6 px-1 space-y-1">
    <h1 className={`${large ? 'text-4xl' : 'text-3xl'} font-bold tracking-tight text-slate-900 dark:text-white`}>
      {title}
    </h1>
    {subtitle && <p className="text-slate-400 dark:text-slate-500 font-semibold text-sm">{subtitle}</p>}
  </div>
);