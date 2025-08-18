"use client"

import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../store/store';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div>
            {children}
            <ToastContainer position="bottom-center" hideProgressBar newestOnTop closeOnClick draggable pauseOnHover={false} />
          </div>
        </PersistGate>
      </Provider>
    </div>
  );
};

export default AppLayout;