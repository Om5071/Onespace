import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../api/searchApi';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Search,
  CheckSquare,
  FileText,
  Calendar,
  FolderArchive,
  Target,
  ArrowRight,
  X
} from 'lucide-react';

export const CommandPaletteModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], notes: [], events: [], documents: [], goals: [] });
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 250);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults({ tasks: [], notes: [], events: [], documents: [], goals: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await searchApi.search(debouncedQuery);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (path) => {
    navigate(path);
    onClose();
  };

  const hasResults =
    results.tasks.length > 0 ||
    results.notes.length > 0 ||
    results.events.length > 0 ||
    results.documents.length > 0 ||
    results.goals.length > 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 my-auto flex w-full max-w-xl max-h-[min(90vh,calc(100dvh-2rem))] flex-col rounded-2xl bg-[#101726] shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
        {/* Search Bar Input */}
        <div className="flex shrink-0 items-center px-4 py-3.5 border-b border-slate-800 bg-[#131D31]">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search tasks, notes, events, goals, documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-4">
          {loading && (
            <div className="p-6 text-center text-xs text-slate-400">
              Searching across OneSpace...
            </div>
          )}

          {!loading && !hasResults && query.trim() !== '' && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No results found for "{query}".
            </div>
          )}

          {!loading && !hasResults && query.trim() === '' && (
            <div className="py-2 px-3 text-xs text-slate-400">
              <p className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 mb-2">Quick Navigation</p>
              <div className="space-y-1">
                <button
                  onClick={() => navigateTo('/tasks')}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1A243B] text-slate-300 text-xs cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-400" /> Go to Tasks
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </button>
                <button
                  onClick={() => navigateTo('/notes')}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1A243B] text-slate-300 text-xs cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" /> Go to Notes
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </button>
                <button
                  onClick={() => navigateTo('/calendar')}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1A243B] text-slate-300 text-xs cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" /> Go to Calendar
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>
          )}

          {/* Render Entity Results */}
          {results.tasks.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tasks</p>
              {results.tasks.map((t) => (
                <div
                  key={t._id}
                  onClick={() => navigateTo('/tasks')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1A243B] cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-slate-200 font-medium truncate">{t.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 capitalize">{t.priority}</span>
                </div>
              ))}
            </div>
          )}

          {results.notes.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</p>
              {results.notes.map((n) => (
                <div
                  key={n._id}
                  onClick={() => navigateTo('/notes')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1A243B] cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-200 font-medium truncate">{n.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{n.category}</span>
                </div>
              ))}
            </div>
          )}

          {results.events.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Events</p>
              {results.events.map((e) => (
                <div
                  key={e._id}
                  onClick={() => navigateTo('/calendar')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1A243B] cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-200 font-medium truncate">{e.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.goals.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Goals</p>
              {results.goals.map((g) => (
                <div
                  key={g._id}
                  onClick={() => navigateTo('/goals')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1A243B] cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Target className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-slate-200 font-medium truncate">{g.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{g.metrics?.currentValue}/{g.metrics?.targetValue} {g.metrics?.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-2.5 bg-[#0B0F19] border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-[#1A243B] text-slate-300 font-mono border border-slate-700">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[#1A243B] text-slate-300 font-mono border border-slate-700">K</kbd></span>
          <button
            onClick={() => navigateTo(`/search?q=${encodeURIComponent(query)}`)}
            className="text-blue-400 hover:underline font-semibold cursor-pointer"
          >
            Open full search page &rarr;
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
