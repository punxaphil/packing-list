import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';
import { ErrorProvider } from './components/shared/ErrorProvider.tsx';
import { BrowserRouter } from 'react-router';
import { StrictMode } from 'react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorProvider>
  </StrictMode>
);
