import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question, UserResponse } from '@/types/quiz';

interface QuizState {
  questions: Question[];
  currentIndex: number;
  responses: UserResponse[];
  startTime: string | null;
  endTime: string | null;
  isLoading: boolean;
  isCompleted: boolean;
  score: number | null;
  timeElapsed: number;
}

const initialState: QuizState = {
  questions: [],
  currentIndex: 0,
  responses: [],
  startTime: null,
  endTime: null,
  isLoading: true,
  isCompleted: false,
  score: null,
  timeElapsed: 0,
};

export const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.startTime = new Date().toISOString();
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addResponse: (state, action: PayloadAction<UserResponse>) => {
      state.responses.push(action.payload);
      if (state.currentIndex === state.questions.length - 1) {
        state.isCompleted = true;
        state.endTime = new Date().toISOString();
      } else {
        state.currentIndex += 1;
      }
    },
    updateTimeElapsed: (state) => {
      if (state.startTime && !state.isCompleted) {
        state.timeElapsed = Math.floor(
          (new Date().getTime() - new Date(state.startTime).getTime()) / 1000
        );
      }
    },
    setScore: (state) => {
      const correctAnswers = state.responses.filter((r) => r.isCorrect).length;
      state.score = (correctAnswers / state.questions.length) * 100;
    },
    resetQuiz: () => initialState,
  },
});

export const {
  setQuestions,
  setLoading,
  addResponse,
  updateTimeElapsed,
  setScore,
  resetQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;
