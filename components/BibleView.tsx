
import React, { useState, useEffect, useMemo } from 'react';
import { BibleBook } from '../types';
import { Card, SectionTitle, Loader, Badge } from './Shared';

const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { name: "Genesis", chapters: 50, testament: 'OT', category: "Pentateuch" },
  { name: "Exodus", chapters: 40, testament: 'OT', category: "Pentateuch" },
  { name: "Levitcus", chapters: 27, testament: 'OT', category: "Pentateuch" },
  { name: "Numbers", chapters: 36, testament: 'OT', category: "Pentateuch" },
  { name: "Deuteronomy", chapters: 34, testament: 'OT', category: "Pentateuch" },
  { name: "Joshua", chapters: 24, testament: 'OT', category: "History" },
  { name: "Judges", chapters: 21, testament: 'OT', category: "History" },
  { name: "Ruth", chapters: 4, testament: 'OT', category: "History" },
  { name: "1 Samuel", chapters: 31, testament: 'OT', category: "History" },
  { name: "2 Samuel", chapters: 24, testament: 'OT', category: "History" },
  { name: "1 Kings", chapters: 22, testament: 'OT', category: "History" },
  { name: "2 Kings", chapters: 25, testament: 'OT', category: "History" },
  { name: "1 Chronicles", chapters: 29, testament: 'OT', category: "History" },
  { name: "2 Chronicles", chapters: 36, testament: 'OT', category: "History" },
  { name: "Ezra", chapters: 10, testament: 'OT', category: "History" },
  { name: "Nehemiah", chapters: 13, testament: 'OT', category: "History" },
  { name: "Esther", chapters: 10, testament: 'OT', category: "History" },
  { name: "Job", chapters: 42, testament: 'OT', category: "Wisdom" },
  { name: "Psalms", chapters: 150, testament: 'OT', category: "Wisdom" },
  { name: "Proverbs", chapters: 31, testament: 'OT', category: "Wisdom" },
  { name: "Ecclesiastes", chapters: 12, testament: 'OT', category: "Wisdom" },
  { name: "Song of Solomon", chapters: 8, testament: 'OT', category: "Wisdom" },
  { name: "Isaiah", chapters: 66, testament: 'OT', category: "Major Prophets" },
  { name: "Jeremiah", chapters: 52, testament: 'OT', category: "Major Prophets" },
  { name: "Lamentations", chapters: 5, testament: 'OT', category: "Major Prophets" },
  { name: "Ezekiel", chapters: 48, testament: 'OT', category: "Major Prophets" },
  { name: "Daniel", chapters: 12, testament: 'OT', category: "Major Prophets" },
  { name: "Hosea", chapters: 14, testament: 'OT', category: "Minor Prophets" },
  { name: "Joel", chapters: 3, testament: 'OT', category: "Minor Prophets" },
  { name: "Amos", chapters: 9, testament: 'OT', category: "Minor Prophets" },
  { name: "Obadiah", chapters: 1, testament: 'OT', category: "Minor Prophets" },
  { name: "Jonah", chapters: 4, testament: 'OT', category: "Minor Prophets" },
  { name: "Micah", chapters: 7, testament: 'OT', category: "Minor Prophets" },
  { name: "Nahum", chapters: 3, testament: 'OT', category: "Minor Prophets" },
  { name: "Habakkuk", chapters: 3, testament: 'OT', category: "Minor Prophets" },
  { name: "Zephaniah", chapters: 3, testament: 'OT', category: "Minor Prophets" },
  { name: "Haggai", chapters: 2, testament: 'OT', category: "Minor Prophets" },
  { name: "Zechariah", chapters: 14, testament: 'OT', category: "Minor Prophets" },
  { name: "Malachi", chapters: 4, testament: 'OT', category: "Minor Prophets" },
  
  // New Testament
  { name: "Matthew", chapters: 28, testament: 'NT', category: "Gospels" },
  { name: "Mark", chapters: 16, testament: 'NT', category: "Gospels" },
  { name: "Luke", chapters: 24, testament: 'NT', category: "Gospels" },
  { name: "John", chapters: 21, testament: 'NT', category: "Gospels" },
  { name: "Acts", chapters: 28, testament: 'NT', category: "History" },
  { name: "Romans", chapters: 16, testament: 'NT', category: "Pauline Epistles" },
  { name: "1 Corinthians", chapters: 16, testament: 'NT', category: "Pauline Epistles" },
  { name: "2 Corinthians", chapters: 13, testament: 'NT', category: "Pauline Epistles" },
  { name: "Galatians", chapters: 6, testament: 'NT', category: "Pauline Epistles" },
  { name: "Ephesians", chapters: 6, testament: 'NT', category: "Pauline Epistles" },
  { name: "Philippians", chapters: 4, testament: 'NT', category: "Pauline Epistles" },
  { name: "Colossians", chapters: 4, testament: 'NT', category: "Pauline Epistles" },
  { name: "1 Thessalonians", chapters: 5, testament: 'NT', category: "Pauline Epistles" },
  { name: "2 Thessalonians", chapters: 3, testament: 'NT', category: "Pauline Epistles" },
  { name: "1 Timothy", chapters: 6, testament: 'NT', category: "Pauline Epistles" },
  { name: "2 Timothy", chapters: 4, testament: 'NT', category: "Pauline Epistles" },
  { name: "Titus", chapters: 3, testament: 'NT', category: "Pauline Epistles" },
  { name: "Philemon", chapters: 1, testament: 'NT', category: "Pauline Epistles" },
  { name: "Hebrews", chapters: 13, testament: 'NT', category: "General Epistles" },
  { name: "James", chapters: 5, testament: 'NT', category: "General Epistles" },
  { name: "1 Peter", chapters: 5, testament: 'NT', category: "General Epistles" },
  { name: "2 Peter", chapters: 3, testament: 'NT', category: "General Epistles" },
  { name: "1 John", chapters: 5, testament: 'NT', category: "General Epistles" },
  { name: "2 John", chapters: 1, testament: 'NT', category: "General Epistles" },
  { name: "3 John", chapters: 1, testament: 'NT', category: "General Epistles" },
  { name: "Jude", chapters: 1, testament: 'NT', category: "General Epistles" },
  { name: "Revelation", chapters: 22, testament: 'NT', category: "Prophecy" },
];

const BibleView: React.FC<{ onAskBuddy?: (context: string) => void }> = ({ onAskBuddy }) => {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [content, setContent] = useState<{ text: string; reference: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTestament, setActiveTestament] = useState<'All' | 'OT' | 'NT'>('All');

  const currentTranslation = useMemo(() => {
    const t = localStorage.getItem('bible_translation') || 'NIV';
    if (t === 'KJV') return 'kjv';
    return 'web'; 
  }, []);

  const fetchScripture = async (book: string, chapter: number) => {
    setLoading(true);
    try {
      const resp = await fetch(`https://bible-api.com/${book}+${chapter}?translation=${currentTranslation}`);
      const data = await resp.json();
      setContent({
        text: data.text,
        reference: data.reference
      });
    } catch (error) {
      console.error("Bible fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      fetchScripture(selectedBook.name, selectedChapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedBook, selectedChapter]);

  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTestament = activeTestament === 'All' || b.testament === activeTestament;
      return matchesSearch && matchesTestament;
    });
  }, [searchTerm, activeTestament]);

  const otBooks = filteredBooks.filter(b => b.testament === 'OT');
  const ntBooks = filteredBooks.filter(b => b.testament === 'NT');

  if (loading) return <Loader />;

  // Reader View
  if (selectedBook && selectedChapter && content) {
    return (
      <div className="space-y-6 pb-32 max-w-2xl mx-auto animate-in fade-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between sticky top-[73px] z-10 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-4 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setSelectedChapter(null)}
            className="flex items-center gap-2 text-indigo-600 font-bold hover:scale-105 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Chapters
          </button>
          <div className="text-center">
            <h2 className="text-xl font-jakarta font-black text-slate-900 dark:text-white leading-none">{selectedBook.name}</h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chapter {selectedChapter}</span>
          </div>
          <button 
            onClick={() => onAskBuddy?.(`I am reading ${selectedBook.name} chapter ${selectedChapter}. Can you explain the main themes of this chapter?`)}
            className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>

        <Card className="p-8 md:p-12 shadow-xl border-none font-serif leading-[2] text-slate-800 dark:text-slate-200 text-lg">
          <div className="whitespace-pre-wrap select-text">
            {content.text.split('\n').map((line, i) => {
              if (!line.trim()) return null;
              return (
                <p key={i} className="mb-6 relative pl-0">
                  {line}
                </p>
              );
            })}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button 
              disabled={selectedChapter === 1}
              onClick={() => setSelectedChapter(selectedChapter - 1)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{currentTranslation.toUpperCase()}</span>
            <button 
              disabled={selectedChapter === selectedBook.chapters}
              onClick={() => setSelectedChapter(selectedChapter + 1)}
              className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              Next
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Chapter Selection View
  if (selectedBook) {
    return (
      <div className="space-y-6 pb-32 max-w-2xl mx-auto animate-in fade-in slide-in-from-right duration-500">
        <button 
          onClick={() => setSelectedBook(null)}
          className="flex items-center gap-2 text-indigo-600 font-bold hover:scale-105 transition-transform px-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          All Books
        </button>
        
        <SectionTitle title={selectedBook.name} subtitle={`${selectedBook.chapters} Chapters`} />
        
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => setSelectedChapter(num)}
              className="aspect-square flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-90"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Book Selection View
  return (
    <div className="space-y-6 pb-32 max-w-2xl mx-auto animate-in fade-in duration-500">
      <SectionTitle title="Holy Bible" subtitle="Explore the 66 books of scripture." />

      <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex gap-1 relative overflow-hidden mb-2">
        {(['All', 'OT', 'NT'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTestament(t)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all relative z-10 ${
              activeTestament === t 
              ? 'text-white' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t === 'All' ? 'All Books' : t === 'OT' ? 'Old Testament' : 'New Testament'}
            {activeTestament === t && (
              <div className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-md animate-in zoom-in duration-200"></div>
            )}
          </button>
        ))}
      </div>

      <div className="relative group">
        <input 
          type="text" 
          placeholder="Search books..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 pl-12 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-indigo-500 transition-all"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>

      <div className="space-y-8">
        {(activeTestament === 'All' || activeTestament === 'OT') && otBooks.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4 px-1">
               <Badge color="amber">Old Testament</Badge>
               <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otBooks.map(book => (
                <button
                  key={book.name}
                  onClick={() => setSelectedBook(book)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{book.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{book.category}</span>
                  </div>
                  <div className="text-slate-300 dark:text-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {(activeTestament === 'All' || activeTestament === 'NT') && ntBooks.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4 px-1">
               <Badge color="indigo">New Testament</Badge>
               <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ntBooks.map(book => (
                <button
                  key={book.name}
                  onClick={() => setSelectedBook(book)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{book.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{book.category}</span>
                  </div>
                  <div className="text-slate-300 dark:text-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleView;
