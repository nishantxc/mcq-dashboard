'use client';

import { QuizAttempt } from '@/types/quiz';

type QuizHist = {
  attempts: QuizAttempt[];
  isLoading: boolean;
}

export default function QuizHistory({ attempts, isLoading }: QuizHist) {

  if (isLoading) {
    return <div>Loading quiz history...</div>;
  }

  if (!attempts || !Array.isArray(attempts) || attempts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* <Header /> */}
        <div className="max-w-4xl mx-auto p-6">
          {/* <h1 className="text-3xl font-bold mb-6">Quiz History</h1> */}
          <div className="text-center py-8 text-gray-500">
            No quiz attempts found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-4">
        {attempts.map((attempt) => (
          <div
            key={attempt.id}
            className="bg-white shadow-md rounded-lg p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 font-semibold">Date:</p>
                <p className="font-medium text-gray-500">
                  {new Date(attempt.completed_at || '').toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Score:</p>
                <p className="font-medium text-gray-500">{attempt.score.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Time Taken:</p>
                <p className="font-medium text-gray-500">{attempt.time_taken} seconds</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Correct Answers:</p>
                <p className="font-medium text-gray-500">
                  {attempt.correct_answers} / {attempt.total_questions}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
