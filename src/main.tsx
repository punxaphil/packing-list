import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';
import { ErrorProvider } from './components/shared/ErrorProvider.tsx';

const elementById = document.getElementById('root');
if (elementById) {
  ReactDOM.createRoot(elementById).render(
    <StrictMode>
      <ErrorProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorProvider>
    </StrictMode>
  );
}
