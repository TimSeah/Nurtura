import { Router,  Route, Routes} from 'react-router-dom';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';

type Options = {
  route?: string;
  path?: string;
  extraRoutes?: React.ReactElement[];
};

export function renderWithRouter(ui: React.ReactElement,
  { route = "/", path = "/", extraRoutes = [] }: Options = {}) {
  const history = createMemoryHistory({ initialEntries: [route] });
  return {
    history,
    ...render(
      <Router location={history.location} navigator={history}>
        <Routes>
          {extraRoutes}
          <Route path={path} element={ui} />
        </Routes>
      </Router>
    ),
  };
}