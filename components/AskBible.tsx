import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { askTheBible } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';

const AskBible: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await supabaseService.getChatHistory();
      if (history.length === 0) {
        setMessages([{ id: '1', role: 'model', text: "Hi! I'm Bible Buddy. I'm here to help you explore God's Word. What's on your mind?" }]);
      } else {
        setMessages(history);
      }
      setLoadingHistory(false);
    };
    loadHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    await supabaseService.saveChatMessage(userMsg);

    try {
      const chatHistory = messages.map(m => ({ role: m.role as string, text: m.text }));
      const responseText = await askTheBible(input, chatHistory);
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
      };
      setMessages(prev => [...prev, botMsg]);
      await supabaseService.saveChatMessage(botMsg);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  if (loadingHistory) return <div className="p-20 text-center text-slate-400">Loading conversation...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-6 px-1 pt-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none ring-4 ring-slate-100/30'}`}>
              {message.role === 'model' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Bible Buddy</span>
                </div>
              )}
              <p className="text-[15px] leading-relaxed whitespace-pre-line font-medium">{message.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-none ring-4 ring-slate-100/30 flex gap-1.5 items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="pt-4 pb-2 sticky bottom-0 bg-slate-50/80 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about faith..."
            className="w-full bg-white border border-slate-200 rounded-[2rem] py-5 pl-6 pr-16 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-xl shadow-indigo-100/20 text-slate-700 text-lg"
          />
          <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 top-2 bg-indigo-600 text-white p-3.5 rounded-full hover:bg-indigo-700 transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95 shadow-md shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AskBible;