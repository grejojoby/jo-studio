import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Application root is missing');
}

// React client root: https://react.dev/reference/react-dom/client/createRoot
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
