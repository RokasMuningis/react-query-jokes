import { StrictMode } from 'react';
import { QueryClientProvider } from 'react-query';
import { render } from 'react-dom';
import './index.css';
import { JokesList } from './JokesList';
import { queryClient } from './query/client';

render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <JokesList />
    </QueryClientProvider>
  </StrictMode>,
  document.getElementById('root'),
);
