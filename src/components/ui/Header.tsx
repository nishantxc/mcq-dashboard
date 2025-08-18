"use client"

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { supabase } from '../../../supabase/Supabase';
import { clear } from 'console';
import { clearuserProfile } from '@/store/slices/userSlice';
import { toast } from 'react-toastify';

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.userProfile);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(clearuserProfile());
      toast.success('Logged out successfully!', { position: 'top-right', autoClose: 2500 });
      router.push('/login');
    } catch (error) {
      toast.error('Error Logging out!', { position: 'top-right', autoClose: 2500 });
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="w-full h-[10vh] bg-white shadow-sm">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">Quiz Dashboard</h1>
          <span className="text-gray-500">|</span>
          <p className="text-gray-600">Welcome, {userProfile?.username || 'User'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-black flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
