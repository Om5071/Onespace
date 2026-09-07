import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Pin, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export const RecentNotes = ({ notes = [], maxItems = 4, showViewAll = true }) => {
  const safeNotes = Array.isArray(notes) ? notes : [];
  const displayed = safeNotes.slice(0, maxItems);

  if (displayed.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-[#131D31]/40">
        No notes yet. Create your first note!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayed.map((note) => (
          <Link
            key={note._id}
            to="/notes"
            className="p-3 rounded-xl bg-[#131D31] border border-slate-800 hover:border-slate-700 hover:bg-[#1A243B] transition-all flex flex-col justify-between space-y-2 group shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                {note.title || 'Untitled Note'}
              </span>
              {note.isPinned && <Pin className="w-3 h-3 text-amber-400 shrink-0" />}
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-2">
              {note.content ? note.content.replace(/[#*`_]/g, '') : 'Empty note'}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
              <span>{formatDate(note.updatedAt || note.createdAt)}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#1A243B] text-slate-300 font-medium border border-slate-700/50">
                {note.category || 'General'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {showViewAll && (
        <div className="pt-2 text-right">
          <Link to="/notes" className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center gap-1">
            All Notes <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
};
