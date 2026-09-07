import React, { useState, useEffect, useRef, useCallback } from 'react';
import { noteApi } from '../api/noteApi';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import { formatDate } from '../utils/formatDate';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  FileText,
  Download,
  Check,
  Save
} from 'lucide-react';

export const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'

  // Editor form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('#3B82F6');

  // Ref tracking current editing values to avoid race conditions
  const currentNoteRef = useRef({
    id: null,
    title: '',
    content: '',
    category: 'General',
    tags: '',
    color: '#3B82F6',
    hasUnsavedChanges: false
  });

  const autoSaveTimerRef = useRef(null);
  const { addToast } = useNotification();

  // Persist current note changes to backend
  const persistNote = useCallback(async (noteId, payload) => {
    if (!noteId) return;
    setSaveStatus('saving');
    try {
      await noteApi.updateNote(noteId, payload);
      setNotes((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) =>
          n._id === noteId ? { ...n, ...payload, updatedAt: new Date() } : n
        )
      );
      if (currentNoteRef.current.id === noteId) {
        currentNoteRef.current.hasUnsavedChanges = false;
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error('Note save error:', err);
      setSaveStatus('unsaved');
    }
  }, []);

  // Flush any pending unsaved changes for the active note
  const flushCurrentNote = useCallback(async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    const { id, title: t, content: c, category: cat, color: col, tags: tg, hasUnsavedChanges } = currentNoteRef.current;
    if (id && hasUnsavedChanges) {
      const payload = {
        title: t || 'Untitled Note',
        content: c || '',
        category: cat || 'General',
        color: col || '#3B82F6',
        tags: tg ? tg.split(',').map((item) => item.trim()).filter(Boolean) : []
      };
      await persistNote(id, payload);
    }
  }, [persistNote]);

  // Switch to a new note safely
  const selectNote = useCallback(async (targetNote) => {
    if (!targetNote) return;
    if (selectedNote && selectedNote._id === targetNote._id) return;

    // First save the previous note if it has unsaved changes
    await flushCurrentNote();

    setSelectedNote(targetNote);
    setTitle(targetNote.title || '');
    setContent(targetNote.content || '');
    setCategory(targetNote.category || 'General');
    setTags((Array.isArray(targetNote.tags) ? targetNote.tags : []).join(', '));
    setColor(targetNote.color || '#3B82F6');

    currentNoteRef.current = {
      id: targetNote._id,
      title: targetNote.title || '',
      content: targetNote.content || '',
      category: targetNote.category || 'General',
      tags: (Array.isArray(targetNote.tags) ? targetNote.tags : []).join(', '),
      color: targetNote.color || '#3B82F6',
      hasUnsavedChanges: false
    };
    setSaveStatus('saved');
  }, [selectedNote, flushCurrentNote]);

  // Schedule auto-save on typing
  const triggerAutoSave = useCallback(() => {
    setSaveStatus('unsaved');
    currentNoteRef.current.hasUnsavedChanges = true;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const { id, title: t, content: c, category: cat, color: col, tags: tg } = currentNoteRef.current;
      if (id) {
        const payload = {
          title: t || 'Untitled Note',
          content: c || '',
          category: cat || 'General',
          color: col || '#3B82F6',
          tags: tg ? tg.split(',').map((item) => item.trim()).filter(Boolean) : []
        };
        persistNote(id, payload);
      }
    }, 600);
  }, [persistNote]);

  // Input change handlers
  const handleTitleChange = (val) => {
    setTitle(val);
    currentNoteRef.current.title = val;
    // Update local preview immediately in sidebar
    if (selectedNote) {
      setNotes((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) =>
          n._id === selectedNote._id ? { ...n, title: val } : n
        )
      );
    }
    triggerAutoSave();
  };

  const handleContentChange = (val) => {
    setContent(val);
    currentNoteRef.current.content = val;
    // Update local preview immediately in sidebar
    if (selectedNote) {
      setNotes((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) =>
          n._id === selectedNote._id ? { ...n, content: val } : n
        )
      );
    }
    triggerAutoSave();
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    currentNoteRef.current.category = val;
    triggerAutoSave();
  };

  const handleManualSave = async () => {
    await flushCurrentNote();
    addToast('Note saved', 'success');
  };

  const fetchNotes = async () => {
    try {
      const res = await noteApi.getNotes({
        search: search || undefined,
        category: selectedCategory || undefined
      });
      if (res.success) {
        const noteList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.notes)
          ? res.data.notes
          : [];
        const catList = Array.isArray(res.data?.categories) ? res.data.categories : [];
        setNotes(noteList);
        if (catList.length > 0) {
          setCategories(catList);
        }
        if (!selectedNote && noteList.length > 0) {
          selectNote(noteList[0]);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await noteApi.getCategories();
      if (res.success) {
        const catList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.categories)
          ? res.data.categories
          : ['Work', 'Personal', 'Finance', 'Ideas', 'Learning', 'Health'];
        setCategories(catList);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchCategories();
    // Flush changes on page leave
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [search, selectedCategory]);

  const handleCreateNote = async () => {
    await flushCurrentNote();
    try {
      const newNoteData = {
        title: 'Untitled Note',
        content: '',
        category: selectedCategory || 'General',
        color: '#3B82F6',
        tags: []
      };
      const res = await noteApi.createNote(newNoteData);
      if (res.success) {
        setNotes((prev) => [res.data, ...(Array.isArray(prev) ? prev : [])]);
        selectNote(res.data);
        addToast('New note created', 'success');
      }
    } catch (err) {
      addToast('Failed to create note', 'error');
    }
  };

  const handleTogglePin = async (e, noteId) => {
    e.stopPropagation();
    try {
      const res = await noteApi.togglePin(noteId);
      if (res.success) {
        setNotes((prev) =>
          (Array.isArray(prev) ? prev : []).map((n) =>
            n._id === noteId ? { ...n, isPinned: res.data.isPinned } : n
          )
        );
        if (selectedNote?._id === noteId) {
          setSelectedNote((prev) => ({ ...prev, isPinned: res.data.isPinned }));
        }
      }
    } catch (err) {
      addToast('Failed to pin note', 'error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await noteApi.deleteNote(noteId);
      const safeList = Array.isArray(notes) ? notes : [];
      const remaining = safeList.filter((n) => n._id !== noteId);
      setNotes(remaining);
      if (selectedNote?._id === noteId) {
        if (remaining.length > 0) selectNote(remaining[0]);
        else setSelectedNote(null);
      }
      addToast('Note deleted', 'success');
    } catch (err) {
      addToast('Failed to delete note', 'error');
    }
  };

  const exportAsTxt = () => {
    if (!selectedNote) return;
    const blob = new Blob([`${title}\n\n${content}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(title || 'note').replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-fade-in overflow-hidden text-slate-100">
      {/* Left Sidebar: Notes List & Categories */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#101726] rounded-2xl border border-slate-800 shadow-xs overflow-hidden shrink-0">
        {/* Top Actions & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white">Notes</h2>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleCreateNote}>
              New
            </Button>
          </div>

          <Input
            icon={Search}
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#131D31] text-slate-400 hover:bg-[#1A243B] hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              All
            </button>
            {safeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#131D31] text-slate-400 hover:bg-[#1A243B] hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Scroll List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {loading ? (
            <Loader size="md" text="Loading notes..." />
          ) : safeNotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No notes found.
            </div>
          ) : (
            safeNotes.map((note) => {
              const isSelected = selectedNote?._id === note._id;
              return (
                <div
                  key={note._id}
                  onClick={() => selectNote(note)}
                  className={`p-4 transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-950/40 to-purple-950/30 border-l-4 border-l-blue-500'
                      : 'hover:bg-[#131D31]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-xs text-white truncate flex-1">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <button
                      onClick={(e) => handleTogglePin(e, note._id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        note.isPinned
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {note.content ? note.content.replace(/[#*`_]/g, '') : 'No content'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#1A243B] text-slate-300 border border-slate-700/50">
                      {note.category || 'General'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Note Editor */}
      <div className="flex-1 flex flex-col bg-[#101726] rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
        {selectedNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-[#131D31]">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManualSave}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#1A243B] hover:bg-[#23304E] text-slate-200 transition-colors cursor-pointer border border-slate-700/60"
                  title="Save note"
                >
                  {saveStatus === 'saving' ? (
                    <span className="text-amber-400 font-medium">Saving...</span>
                  ) : saveStatus === 'unsaved' ? (
                    <span className="text-blue-400 font-semibold flex items-center gap-1">
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </button>

                <div className="h-4 w-px bg-slate-800" />

                {/* Category Selector */}
                <input
                  type="text"
                  placeholder="Category"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="text-xs font-medium bg-[#1A243B] text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1 w-28 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportAsTxt}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1A243B] cursor-pointer transition-colors"
                  title="Export Note (.txt)"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteNote(selectedNote._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-[#1A243B] cursor-pointer transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Editor Area */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note Title"
                className="text-2xl font-bold text-white bg-transparent border-none focus:outline-none placeholder-slate-500"
              />

              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write your note in Markdown or plain text..."
                className="flex-1 w-full text-sm text-slate-200 bg-transparent border-none focus:outline-none placeholder-slate-500 resize-none font-mono leading-relaxed min-h-[300px]"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
            <div>
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-300">Select a note or create a new one</p>
              <Button variant="primary" size="sm" icon={Plus} className="mt-4" onClick={handleCreateNote}>
                Create Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
