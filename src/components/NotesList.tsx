import { FileText, Plus, Trash2 } from 'lucide-react';
import { Note } from '../types';

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onDeleteNote: (noteId: string) => void;
}

export function NotesList({ notes, selectedNote, onSelectNote, onNewNote, onDeleteNote }: NotesListProps) {
  return (
    <div className="w-80 bg-white rounded-lg shadow-sm flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No notes yet</p>
            <p className="text-sm mt-1">Create your first note to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedNote?.id === note.id
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
                onClick={() => onSelectNote(note)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    {note.subject && (
                      <p className="text-xs text-blue-600 mt-1">{note.subject}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {note.content}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
