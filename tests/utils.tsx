import { ReactNode } from 'react';
import { MemoryRouter, Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';

export function renderWithRouter(ui: React.ReactNode, route = '/') {
  const history = createMemoryHistory({ initialEntries: [route] });
  return {
    history,
    ...render(<Router location={history.location} navigator={history}>{ui}</Router>)
  };
}