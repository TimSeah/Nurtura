import { screen, fireEvent, waitFor } from '@testing-library/react';
import Forum from '../../src/pages/forum/Forum';
import { renderWithRouter } from './utils';
import { mockFetchOnce } from './mockFetch';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

const sampleThreads = [
  { _id: 1, title: 'Hello', content: 'World', author: 'A good grandkid', date: new Date().toISOString(), upvotes: 3, replies: 0 },
  { _id: 2, title: 'Other', content: 'Thing', author: 'Someone else',    date: new Date().toISOString(), upvotes: 1, replies: 0 },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks()
});

describe('Forum: UI test cases', () => {

  test('shows loading then threads', async () => {
    mockFetchOnce(sampleThreads); // initial GET
    renderWithRouter(<Forum />);

    expect(screen.getByText(/Loading threads/i)).toBeInTheDocument();
    expect(await screen.findByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  test('handles fetch error', async () => {
    mockFetchOnce({ msg: 'fail' }, false, 500);
    renderWithRouter(<Forum />);

    expect(await screen.findByText(/Error loading threads/i)).toBeInTheDocument();
  });

  test('filters “My Threads”', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');

    fireEvent.click(screen.getByRole('button', { name: /My Threads/i }));
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });

  test('validates form when empty', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');

    fireEvent.click(screen.getByRole('button', { name: /\+ New Thread/i }));
    fireEvent.click(screen.getByRole('button', { name: /Create Thread/i }));
    expect(screen.getByText(/Title and content are required/i)).toBeInTheDocument();
  });

  test('posts new thread & refreshes', async () => {
    mockFetchOnce(sampleThreads);                    // initial GET
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');

    fireEvent.click(screen.getByRole('button', { name: /\+ New Thread/i }));

    fireEvent.change(screen.getByLabelText(/Title/i),   { target: { value: 'New T' } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'Body' } });

    const created = { ...sampleThreads[0], _id: 3, title: 'New T', content: 'Body' };

    mockFetchOnce(created);                           // POST
    mockFetchOnce([...sampleThreads, created]);       // refresh GET

    fireEvent.click(screen.getByRole('button', { name: /Create Thread/i }));

    await waitFor(() => expect(screen.queryByText(/Create New Thread/i)).not.toBeInTheDocument());
    expect(await screen.findByText('New T')).toBeInTheDocument();
  });
});

describe('Forum: Integration test cases', () => {
  // Integration test: clicking a thread navigates to thread detail page
  test('navigates to thread detail page on thread click', async () => {
    mockFetchOnce(sampleThreads);
    const { container, history } = renderWithRouter(<Forum />);
    await screen.findByText('Hello');

    const threadLink = screen.getByRole('link', { name: /Hello/i });
    fireEvent.click(threadLink);

    // Check that the URL changed to the thread detail page
    await waitFor(() =>
      expect(history.location.pathname).toBe('/threads/1')
  );
  });
});
