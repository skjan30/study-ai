import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Note } from '../types';

interface QuizGeneratorProps {
  note: Note;
  onClose: () => void;
  onQuizGenerated: () => void;
}

export function QuizGenerator({ note, onClose, onQuizGenerated }: QuizGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const generateQuiz = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const questions = generateQuestionsFromContent(note.content, numQuestions);

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          note_id: note.id,
          user_id: user.id,
          title: `${note.title} - Quiz`,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      const questionsToInsert = questions.map((q, index) => ({
        quiz_id: quiz.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        order: index,
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      onQuizGenerated();
      onClose();
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Generate Quiz</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Generate a quiz from your note: <strong>{note.title}</strong>
          </p>

          <label className="block mb-2 text-sm font-medium text-gray-700">
            Number of Questions
          </label>
          <input
            type="number"
            min="3"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={generateQuiz}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          {generating ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>
    </div>
  );
}

function generateQuestionsFromContent(content: string, numQuestions: number) {
  const sentences = content
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const questions = [];
  const usedSentences = new Set();

  for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
    let sentenceIndex;
    do {
      sentenceIndex = Math.floor(Math.random() * sentences.length);
    } while (usedSentences.has(sentenceIndex));

    usedSentences.add(sentenceIndex);
    const sentence = sentences[sentenceIndex];

    const words = sentence.split(' ').filter(w => w.length > 3);
    if (words.length < 3) continue;

    const keywordIndex = Math.floor(Math.random() * Math.min(words.length, words.length - 2));
    const keyword = words[keywordIndex];

    const question = sentence.replace(keyword, '_____');

    const correctAnswer = keyword;
    const wrongAnswers = generateWrongAnswers(correctAnswer, words);

    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAnswer);

    questions.push({
      question: `Fill in the blank: ${question}`,
      options,
      correct_answer: correctIndex,
    });
  }

  return questions;
}

function generateWrongAnswers(correctAnswer: string, availableWords: string[]): string[] {
  const wrongAnswers: string[] = [];
  const candidates = availableWords.filter(w =>
    w !== correctAnswer &&
    w.length >= correctAnswer.length - 2 &&
    w.length <= correctAnswer.length + 2
  );

  while (wrongAnswers.length < 3 && candidates.length > 0) {
    const index = Math.floor(Math.random() * candidates.length);
    wrongAnswers.push(candidates[index]);
    candidates.splice(index, 1);
  }

  while (wrongAnswers.length < 3) {
    wrongAnswers.push(`Option ${wrongAnswers.length + 1}`);
  }

  return wrongAnswers;
}
