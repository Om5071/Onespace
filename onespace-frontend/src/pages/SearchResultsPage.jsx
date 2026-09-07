import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchApi } from '../api/searchApi';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { formatDate } from '../utils/formatDate';
import {
  Search,
  CheckSquare,
  FileText,
  Calendar,
  FolderArchive,
  Target,
  ArrowRight
} from 'lucide-react';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ tasks: [], notes: [], events: [], documents: [], goals: [] });
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const navigate = useNavigate();

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setResults({ tasks: [], notes: [], events: [], documents: [], goals: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await searchApi.search(term, selectedType);
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, selectedType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    handleSearch(query);
  };

  const totalResults =
    (results.tasks?.length || 0) +
    (results.notes?.length || 0) +
    (results.events?.length || 0) +
    (results.documents?.length || 0) +
    (results.goals?.length || 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto text-slate-100">
      {/* Header & Search Bar */}
      <div>
        <h1 className="text-2xl font-bold text-white">Global Search</h1>
        <p className="text-xs text-slate-400 mt-0.5">Find anything across your OneSpace workspace instantly</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          icon={Search}
          placeholder="Search by keywords, tags, dates..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Results' },
          { id: 'tasks', label: `Tasks (${results.tasks?.length || 0})` },
          { id: 'notes', label: `Notes (${results.notes?.length || 0})` },
          { id: 'events', label: `Events (${results.events?.length || 0})` },
          { id: 'documents', label: `Documents (${results.documents?.length || 0})` },
          { id: 'goals', label: `Goals (${results.goals?.length || 0})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === tab.id
                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader size="lg" text="Searching OneSpace..." />
      ) : totalResults === 0 && query ? (
        <div className="text-center py-16 bg-[#101726] rounded-2xl border border-dashed border-slate-800">
          <Search className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-400">No results found matching "{query}".</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tasks Results */}
          {(selectedType === 'all' || selectedType === 'tasks') && results.tasks?.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-400" /> Tasks ({results.tasks.length})
              </h2>
              <div className="bg-[#101726] rounded-2xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                {results.tasks.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => navigate('/tasks')}
                    className="p-3.5 hover:bg-[#131D31] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{t.title}</p>
                      {t.description && <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>}
                    </div>
                    <Badge variant={t.priority === 'urgent' ? 'danger' : 'brand'} size="xs">
                      {t.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Results */}
          {(selectedType === 'all' || selectedType === 'notes') && results.notes?.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" /> Notes ({results.notes.length})
              </h2>
              <div className="bg-[#101726] rounded-2xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                {results.notes.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => navigate('/notes')}
                    className="p-3.5 hover:bg-[#131D31] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{n.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{n.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-500">{formatDate(n.updatedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {(selectedType === 'all' || selectedType === 'events') && results.events?.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" /> Events ({results.events.length})
              </h2>
              <div className="bg-[#101726] rounded-2xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                {results.events.map((e) => (
                  <div
                    key={e._id}
                    onClick={() => navigate('/calendar')}
                    className="p-3.5 hover:bg-[#131D31] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{e.title}</p>
                      <p className="text-[11px] text-slate-400">{formatDate(e.startDateTime || e.startTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals Results */}
          {(selectedType === 'all' || selectedType === 'goals') && results.goals?.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-400" /> Goals ({results.goals.length})
              </h2>
              <div className="bg-[#101726] rounded-2xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                {results.goals.map((g) => (
                  <div
                    key={g._id}
                    onClick={() => navigate('/goals')}
                    className="p-3.5 hover:bg-[#131D31] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{g.title}</p>
                      <p className="text-[11px] text-slate-400">{g.progressPercent || 0}% completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
