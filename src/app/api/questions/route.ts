import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '../../../../supabase/Supabase';
import { getSupabaseWithUser } from '@/utils/userFromSb';

export async function GET(request: NextRequest) {
  try {
    const {user, supabase} = await getSupabaseWithUser(request)
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*');

    if (error) throw error;

    // Randomize questions order
    // Validate the question data
    const validQuestions = questions?.filter(q => 
      q && 
      typeof q.question === 'string' && 
      Array.isArray(q.options) &&
      typeof q.correct_answer === 'string'
    );

    const shuffledQuestions = validQuestions.sort(() => Math.random() - 0.5);

    return NextResponse.json(shuffledQuestions);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const {user, supabase} = await getSupabaseWithUser(request)
    const body = await request.json();
    const { question, options, correct_answer } = body;

    const { data, error } = await supabase
      .from('questions')
      .insert([{ question, options, correct_answer }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
