import { getSupabaseWithUser } from '@/utils/userFromSb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {user, supabase} = await getSupabaseWithUser(request)
    const body = await request.json();
    const { 
      userId,
      totalQuestions,
      correctAnswers,
      timeTaken,
      responses
    } = body;

    // Create quiz attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        completed_at: new Date().toISOString(),
        time_taken: timeTaken,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        score: (correctAnswers / totalQuestions) * 100
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // Store individual responses
    const userResponses = responses.map((response: any) => ({
      attempt_id: attemptData.id,
      question_id: response.questionId,
      user_answer: response.answer,
      is_correct: response.isCorrect
    }));

    const { error: responsesError } = await supabase
      .from('user_responses')
      .insert(userResponses);

    if (responsesError) throw responsesError;

    return NextResponse.json(attemptData);
  } catch (error) {
    console.error('Error in responses route:', error);
    
    let errorMessage = 'An error occurred while saving the quiz responses';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error
      }, 
      { status: 500 }
    );
  }
}
