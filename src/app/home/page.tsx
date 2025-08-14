"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { supabase } from '../../../supabase/Supabase';
import Header from '@/components/ui/Header';
import QuizHistory from '@/components/QuizHistory';
import { div } from 'framer-motion/client';
import { QuizAttempt } from '@/types/quiz';
import { adduserProfile } from '@/store/slices/userSlice';

interface QuizResult {
    id: string;
    user_id: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    time_taken: number;
    created_at: string;
}

export default function HomePage() {
    const router = useRouter();
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const userProfile = useSelector((state: RootState) => state.userProfile);

    const dispatch = useDispatch();

    useEffect(() => {
        fetchQuizHistory();
    }, []);

    const fetchQuizHistory = async () => {
        try {
            const userId = userProfile ? userProfile.id : '';
            if (!userId) {
                console.log('No user ID available');
                setAttempts([]);
                setIsLoading(false);
                return;
            }
            const response = await fetch(`/api/results?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch quiz history');
            }
            const data = await response.json();
            console.log('Fetched quiz history:', data);
            setAttempts(Array.isArray(data) ? data : []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching quiz history:', error);
            setAttempts([]);
            setIsLoading(false);
        }
    };


    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            dispatch(adduserProfile({
                id: '',
                user_id: '',
                username: '',
                avatar: ''
            }));
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/login');
                    return;
                }

                // Set user profile in Redux
                const userProfile = {
                    id: session.user.id,
                    user_id: session.user.id,
                    username: session.user.email?.split('@')[0] || 'User',
                    avatar: '',  // You can add default avatar if needed
                };
                dispatch(adduserProfile(userProfile));
                setLoading(false);
            } catch (error) {
                console.error('Auth error:', error);
                router.push('/login');
            }
        };

        checkAuth();
    }, [dispatch, router]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Header />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Instructions Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Quiz Instructions</h2>
                        <div className="space-y-3 text-gray-600">
                            <p>• Each quiz consists of multiple choice questions</p>
                            <p>• Select the best answer from the given options</p>
                            <p>• Your time and score will be recorded</p>
                            <p>• Results will be shown immediately after completion</p>
                            <p>• You can retake the quiz multiple times</p>
                        </div>
                        <button
                            onClick={() => router.push('/quiz')}
                            className="w-full mt-4 bg-black hover:bg-black/80 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                        >
                            Start New Quiz
                        </button>
                    </div>

                    {/* Recent Results Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Results</h2>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div>
                                <QuizHistory attempts={attempts} isLoading={isLoading} />
                            </div>
                        )}
                        {/* : (
                        <div className="text-center py-8 text-gray-500">
                            No quiz attempts yet. Start your first quiz!
                        </div>
            )} */}
                    </div>
                </div>
            </main>
        </div>
    );
}
