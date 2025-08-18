"use client";

import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../supabase/Supabase';
import SignupForm from '../../components/SignupForm';

const SignupPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
      }
    };
    checkUser();
  }, []);

  return (
      <SignupForm onSignupSuccess={() => setIsLoggedIn(true)} />
  );
};

export default SignupPage;