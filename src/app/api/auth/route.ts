import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uvsqpmaejmaelmgtyjax.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2c3FwbWFlam1hZWxtZ3R5amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NTAyNDUsImV4cCI6MjA2ODMyNjI0NX0.I4PtgWzFq_x-uKu8idA7zdfgeC3OY0mBc2LekIjYKzE'

const supabase = createClient(supabaseUrl, supabaseKey)

// Simple, conservative email validation regex (sufficient for basic checks)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MAX_PASSWORD_LENGTH = 128

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Sanitize and normalize inputs
    const actionRaw = payload?.action
    const emailRaw = payload?.email
    const passwordRaw = payload?.password

    const action = typeof actionRaw === 'string' ? actionRaw.trim().toLowerCase() : ''
    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : ''
    const password = typeof passwordRaw === 'string' ? passwordRaw : ''

    // Basic validation
    if (!action || !['signup', 'signin'].includes(action)) {
      return NextResponse.json({ error: 'Invalid or missing action' }, { status: 400 })
    }

    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (action === 'signup') {
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
      }
      if (password.length > MAX_PASSWORD_LENGTH) {
        return NextResponse.json({ error: 'Password is too long' }, { status: 400 })
      }

      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signupError) {
        return NextResponse.json({ error: signupError.message }, { status: 400 })
      }

      return NextResponse.json({
        message: 'User created successfully',
        user: signupData.user,
      })
    }

    if (action === 'signin') {
      if (!password || password.length === 0) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 })
      }
      if (password.length > MAX_PASSWORD_LENGTH) {
        return NextResponse.json({ error: 'Password is too long' }, { status: 400 })
      }

      const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signinError) {
        return NextResponse.json({ error: signinError.message }, { status: 400 })
      }

      return NextResponse.json({
        message: 'Signed in successfully',
        user: signinData.user,
        session: signinData.session,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const actionRaw = searchParams.get('action')
    const action = actionRaw ? actionRaw.trim().toLowerCase() : ''

    if (action === 'user') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
      }

      // Sanitize token
      const token = authHeader.replace(/^\s*Bearer\s+/i, '').trim()
      if (!token || token.length < 10) {
        return NextResponse.json({ error: 'Invalid authorization token' }, { status: 401 })
      }

      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }

      return NextResponse.json({ user })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}