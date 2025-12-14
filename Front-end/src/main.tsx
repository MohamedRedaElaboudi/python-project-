import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app';
import AppRouter from './router';
import { ErrorBoundary } from './routes/components';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>

      <BrowserRouter>
        <App>
          <AppRouter />
        </App>
      </BrowserRouter>

  </StrictMode>
);
