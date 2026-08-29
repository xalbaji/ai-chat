import { render, screen } from '@testing-library/react';
import App from './App';

test('renders saved sessions with ISO timestamp strings without crashing', () => {
  const now = new Date('2024-01-01T12:30:00Z').toISOString();

  localStorage.setItem(
    'chat_sessions',
    JSON.stringify([
      {
        id: 1,
        title: 'Saved chat',
        messages: [
          {
            id: 10,
            role: 'assistant',
            content: 'Hello from storage',
            timestamp: now,
          },
        ],
      },
    ])
  );

  render(<App />);

  expect(screen.getByText(/saved chat/i)).toBeInTheDocument();
  expect(screen.getByText(/hello from storage/i)).toBeInTheDocument();
});
