'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../store/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
        <ToastContainer 
          position="bottom-center" 
          hideProgressBar 
          newestOnTop 
          closeOnClick 
          draggable 
          pauseOnHover={false} 
        />
      </PersistGate>
    </Provider>
  );
}
