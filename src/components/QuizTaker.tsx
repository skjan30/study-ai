import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trophy, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Quiz, QuizQuestion } from '../types';

interface QuizTakerProps {
  quiz: Quiz;
  onClose: () => void;
}

export function QuizTaker({ quiz, onClose }: QuizTakerProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [quiz.id]);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('quiz_attempts').insert({
        quiz_id: quiz.id,
        user_id: user.id,
        score: correctCount,
        total_questions: questions.length,
        answers,
      });
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-8">
          <div className="text-center mb-6">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
            <p className="text-5xl font-bold text-blue-600 mb-2">
              {score} / {questions.length}
            </p>
            <p className="text-gray-600">
              {Math.round((score / questions.length) * 100)}% correct
            </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
            {questions.map((q, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === q.correct_answer;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{q.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your answer: {q.options[userAnswer]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600 mt-1">
                          Correct answer: {q.options[q.correct_answer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full mb-6">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-6">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  answers[currentQuestion] === index
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={answers[currentQuestion] === undefined}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
