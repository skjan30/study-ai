import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { BookOpen, FileText, Brain, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';
import { QuizGenerator } from './components/QuizGenerator';
import { QuizList } from './components/QuizList';
import { QuizTaker } from './components/QuizTaker';
import { Note, Quiz } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'notes' | 'quizzes'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadNotes();
      loadQuizzes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const handleSaveNote = (note: Note) => {
    setSelectedNote(note);
    loadNotes();
  };

  const handleNewNote = () => {
    setSelectedNote(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw error;

      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleGenerateQuiz = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setSelectedNote(note);
      setShowQuizGenerator(true);
    }
  };

  const handleQuizGenerated = () => {
    loadQuizzes();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Study AI</h1>
              <p className="text-xs text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex gap-2">
              <button
                onClick={() => setView('notes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'notes'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Notes
              </button>
              <button
                onClick={() => setView('quizzes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'quizzes'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Brain className="w-4 h-4" />
                Quizzes
              </button>
            </nav>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          {view === 'notes' ? (
            <>
              <NotesList
                notes={notes}
                selectedNote={selectedNote}
                onSelectNote={setSelectedNote}
                onNewNote={handleNewNote}
                onDeleteNote={handleDeleteNote}
              />
              <NoteEditor
                note={selectedNote}
                onSave={handleSaveNote}
                onGenerateQuiz={handleGenerateQuiz}
              />
            </>
          ) : (
            <>
              <QuizList quizzes={quizzes} onSelectQuiz={setSelectedQuiz} />
              <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-sm">
                <div className="text-center text-gray-500">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a quiz to start practicing</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {showQuizGenerator && selectedNote && (
        <QuizGenerator
          note={selectedNote}
          onClose={() => setShowQuizGenerator(false)}
          onQuizGenerated={handleQuizGenerated}
        />
      )}

      {selectedQuiz && (
        <QuizTaker
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
        />
      )}
    </div>
  );
}

export default App;
