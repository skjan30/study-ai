import { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Note } from '../types';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Note) => void;
  onGenerateQuiz: (noteId: string) => void;
}

export function NoteEditor({ note, onSave, onGenerateQuiz }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSubject(note.subject);
    } else {
      setTitle('');
      setContent('');
      setSubject('');
    }
  }, [note]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (note) {
        const { data, error } = await supabase
          .from('notes')
          .update({ title, content, subject, updated_at: new Date().toISOString() })
          .eq('id', note.id)
          .select()
          .single();

        if (error) throw error;
        if (data) onSave(data);
      } else {
        const { data, error } = await supabase
          .from('notes')
          .insert({ title, content, subject, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        if (data) onSave(data);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Subject (e.g., Biology, Math, History)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full mt-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none"
        />
      </div>

      <textarea
        placeholder="Start taking notes... Write your study material here and generate quizzes from it later!"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 p-6 text-gray-700 leading-relaxed resize-none focus:outline-none"
      />

      <div className="p-4 border-t border-gray-200 flex justify-between">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Note'}
        </button>

        {note && (
          <button
            onClick={() => onGenerateQuiz(note.id)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate Quiz
          </button>
        )}
      </div>
    </div>
  );
}
