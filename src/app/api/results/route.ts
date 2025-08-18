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
      score,
      timeTaken,
      responses 
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Create quiz attempt
    const { data: resultData, error: resultError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        started_at: new Date().toISOString(), // Set the started_at timestamp
        completed_at: new Date().toISOString(),
        time_taken: timeTaken,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        score: score
      })
      .select()
      .single();

    if (resultError) {
      console.error('Error saving result:', resultError);
      return NextResponse.json(
        { error: resultError.message || 'Error saving quiz result' },
        { status: 500 }
      );
    }

    // Store individual result responses
    // const resultResponses = responses.map((response: any) => ({
    //   result_id: resultData.id,
    //   question_id: response.questionId,
    //   user_answer: response.answer,
    //   is_correct: response.isCorrect
    // }));

    // const { error: responsesError } = await supabase
    //   .from('result_responses')
    //   .insert(resultResponses);

    // if (responsesError) {
    //   console.error('Error saving result responses:', responsesError);
    //   throw responsesError;
    // }

    return NextResponse.json(resultData);
  } catch (error) {
    console.error('Error in results route:', error);
    
    let errorMessage = 'An error occurred while saving the quiz results';
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

export async function GET(request: NextRequest) {
  try {
    const {user, supabase} = await getSupabaseWithUser(request)
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: results, error: resultsError } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        user_responses (
          question_id,
          user_answer,
          is_correct
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (resultsError) {
      console.error('Error fetching results:', resultsError);
      return NextResponse.json(
        { error: resultsError.message || 'Error fetching quiz results' },
        { status: 500 }
      );
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
