import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

window.addEventListener('error', (event) => {
  console.error('[Global Error Listener]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    errorObj: event.error,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global Unhandled Rejection]', {
    reason: event.reason,
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
