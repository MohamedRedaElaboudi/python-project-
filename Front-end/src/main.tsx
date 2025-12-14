// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
import App from './app';
import AppRouter from './router';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App>
      <AppRouter />
    </App>
  </StrictMode>
);
