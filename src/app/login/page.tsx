"use client"

import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../supabase/Supabase';
import LoginForm from '../../components/LoginForm';

const LoginPage = () => {
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
      <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
  );
};

export default LoginPage;