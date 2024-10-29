import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { authService } from './services/authService';

// Initialize default admin user
(async () => {
  try {
    await authService.initializeDefaultAdmin();
    console.log('Default admin initialized');
  } catch (error) {
    console.error('Failed to initialize admin:', error);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);