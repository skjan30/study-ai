import { Brain, Trophy } from 'lucide-react';
import { Quiz } from '../types';

interface QuizListProps {
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
}

export function QuizList({ quizzes, onSelectQuiz }: QuizListProps) {
  return (
    <div className="w-80 bg-white rounded-lg shadow-sm flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          My Quizzes
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {quizzes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No quizzes yet</p>
            <p className="text-sm mt-1">Generate quizzes from your notes</p>
          </div>
        ) : (
          <div className="p-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 mb-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-colors border border-purple-200"
                onClick={() => onSelectQuiz(quiz)}
              >
                <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Created {new Date(quiz.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
