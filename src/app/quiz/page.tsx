"use client"

import { redirect, useRouter } from 'next/navigation';
import Quiz from '@/components/Quiz';
import { supabase } from '../../../supabase/Supabase';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { useState, useEffect } from 'react';
import { adduserProfile } from '@/store/slices/userSlice';
import Header from '@/components/ui/Header';

export default function QuizPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const dispatch = useDispatch();

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

    const userProfile = useSelector((state: RootState) => state.userProfile);


    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Header />
            {loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    <h1 className="text-3xl text-black font-bold text-center py-8">MCQ Quiz</h1>
                    <Quiz />
                </>
            )}
        </div>
    );
}
