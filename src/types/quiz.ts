export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  time_taken: number;
  total_questions: number;
  correct_answers: number;
  score: number;
}

export interface UserResponse {
  questionId: string;
  answer: string;
  isCorrect: boolean;
}
