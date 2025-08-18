"use client";

import {
  addResponse,
  resetQuiz,
  setLoading,
  setQuestions,
  setScore,
  updateTimeElapsed,
} from '@/store/slices/quizSlice';
import { RootState } from '@/store/store';
import { api } from '@/utils/api';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Fisher–Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function Quiz() {

  // const[loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.userProfile);
  const {
    questions,
    currentIndex,
    responses,
    startTime,
    endTime,
    isLoading,
    isCompleted,
    score,
    timeElapsed,
  } = useSelector((state: RootState) => state.quiz);

  useEffect(() => {
    const initializeQuiz = async () => {
      dispatch(setLoading(true));
      try {
        const response = await api.questions.getQuestions();
        dispatch(setQuestions(shuffleArray(response))); // 🔀 Fisher-Yates shuffle
      } catch (error) {
        console.error('Error fetching questions:', error);
        dispatch(setLoading(false));
      }
    };
    dispatch(resetQuiz());
    initializeQuiz();
  }, [dispatch]);

  // Real-time timer
  useEffect(() => {
    if (!startTime || isCompleted) return;
    const interval = setInterval(() => {
      dispatch(updateTimeElapsed());
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isCompleted, dispatch]);

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    try {
      dispatch(addResponse({
        questionId: currentQuestion.id,
        answer,
        isCorrect,
      }));
    } catch (error) {
      toast.error('Failed to save your answer. Please try again.', {
        position: 'top-right',
      });
    }
  };

  const submitQuiz = async () => {
    // Ensure we're executing this on the client side
    if (typeof window === 'undefined') return;

    try {
      dispatch(setScore());
      const correctAnswers = responses.filter((r) => r.isCorrect).length;
      const timeTaken = Math.floor(
        (new Date(endTime!).getTime() - new Date(startTime!).getTime()) / 1000
      );

      await api.responses.saveResponses({
        userId: user.id,
        totalQuestions: questions.length,
        correctAnswers,
        timeTaken,
        responses: responses,
      });
      toast.success('Test Submitted Successfully!', { position: 'top-right', autoClose: 2500 });

    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  const handleReturn = () => {
    if (isCompleted) {
      router.push('/home');
    } else {
      toast.error('Your test wont be saved!', { position: 'top-right', autoClose: 2500 });
      router.push('/home');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ToastContainer />
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <ToastContainer />
        <h2 className="text-2xl text-black font-bold mb-4">Quiz Completed!</h2>
        <div className="bg-black shadow-md rounded-lg p-6">
          {score !== null ? (
            <>
              <p className="text-lg mb-2">
                Score: {score.toFixed(2)}%
              </p>
              <p className="mb-2">
                Time taken: {timeElapsed} seconds
              </p>
              <p className="mb-4">
                Correct answers: {responses.filter((r) => r.isCorrect).length} out of{' '}
                {questions.length}
              </p>
              <div className="w-full text-end py-4">
                <button
                  onClick={() => router.push('/home')}
                  className='text-2xl text-white font-light p-2 px-4 hover:text-black hover:bg-white border border-white rounded-lg transition-colors ease-in-out duration-500'
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-lg mb-4 text-white">Ready to submit your answers?</p>
              <button
                onClick={submitQuiz}
                className="text-2xl text-white font-light p-2 px-4 hover:text-black hover:bg-white border border-white rounded-lg transition-colors ease-in-out duration-500"
              >
                Submit Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div>
        <ToastContainer />
        No question available
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ToastContainer />
      <div 
        onClick={() => handleReturn()} 
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleReturn()}
        className='underline text-black flex items-center mb-4 gap-1 cursor-pointer'
        aria-label="Return to previous page">
        <ArrowLeft size={14} />
        <p >back</p>
      </div>
      {/* Progress + Timer */}
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-semibold text-gray-700">
          Time: {timeElapsed}s
        </span>
      </div>

      <div className="bg-black shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        <div className="space-y-3">
          {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="w-full text-left p-3 rounded-md border border-gray-300 hover:bg-gray-50 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
              aria-label={`Select answer: ${option}`}
              role="radio"
              aria-checked={responses[currentIndex]?.answer === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
