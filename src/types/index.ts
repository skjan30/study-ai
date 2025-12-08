export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  subject: string;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  note_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  answers: Record<string, number>;
  completed_at: string;
}
