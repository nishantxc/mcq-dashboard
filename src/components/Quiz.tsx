"use client";

import { useState, useEffect } from 'react';
import { Question, UserResponse } from '@/types/quiz';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import TabTracker from './TabTracker';
import { ArrowLeft } from 'lucide-react';

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const router = useRouter();
  const user = useSelector((state: RootState) => state.userProfile);



  useEffect(() => {
    const initializeQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/questions');
        const data = await response.json();
        console.log('Fetched questions:', data);
        
        setQuestions(data);
        // Use useEffect to set the start time after component mount
        // This ensures client-side only execution
        setStartTime(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
      setIsLoading(false);
    };

    initializeQuiz();
  }, []);

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    setResponses(prevResponses => {
      const newResponses = [
        ...prevResponses,
        {
          questionId: currentQuestion.id,
          answer,
          isCorrect,
        },
      ];

      if (currentIndex === questions.length - 1) {
        setIsCompleted(true);
        setEndTime(new Date());
      } else {
        setCurrentIndex(currentIndex + 1);
      }

      return newResponses;
    });
  };

  const submitQuiz = async () => {
    // Ensure we're executing this on the client side
    if (typeof window === 'undefined') return;

    const correctAnswers = responses.filter((r) => r.isCorrect).length;
    const scoreValue = (correctAnswers / questions.length) * 100;
    setScore(scoreValue);

    const timeTaken = Math.floor(
      (endTime!.getTime() - startTime!.getTime()) / 1000
    );

    try {
      // First save to responses endpoint
      await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id, // Replace with actual user ID from auth
          totalQuestions: questions.length,
          correctAnswers,
          timeTaken,
          responses,
        }),
      });

      // Then save to results endpoint
      await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id, // Replace with actual user ID from auth
          totalQuestions: questions.length,
          correctAnswers,
          score: scoreValue,
          timeTaken,
          responses,
        }),
      });

    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  const handleReturn = () => {
    if (isCompleted) {
      router.push('/home');
    } else {
      alert('Your test wont be saved!');
      router.push('/home');
    }
  };

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl text-black font-bold mb-4">Quiz Completed!</h2>
        <div className="bg-black shadow-md rounded-lg p-6">
          {score !== null ? (
            <>
              <p className="text-lg mb-2">
                Score: {score.toFixed(2)}%
              </p>
              <p className="mb-2">
                Time taken: {Math.floor(
                  ((endTime?.getTime() || 0) - (startTime?.getTime() || 0)) / 1000
                )} seconds
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
    return <div>No question available</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* <TabTracker /> */}
      <div onClick={() => handleReturn()} className='underline text-black flex items-center mb-4 gap-1 cursor-pointer'>
        <ArrowLeft size={14}/>
        <p >back</p>
      </div>
      <div className="mb-4">
        <span className="text-sm text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="bg-black shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        <div className="space-y-3">
          {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="w-full text-left p-3 rounded-md border border-gray-300 hover:bg-gray-50 hover:text-black transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
