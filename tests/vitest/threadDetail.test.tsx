import { screen, fireEvent, waitFor } from '@testing-library/react';
import ThreadDetail from '../../src/pages/forum/ThreadDetail';
import { renderWithRouter } from './utils';
import { mockFetchOnce } from './mockFetch';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

const sampleThread = {
  _id: 1,
  title: 'Test Thread',
  content: 'Thread content',
  author: 'Good Commenter',
  date: new Date().toISOString(),
  upvotes: 2,
  replies: 1,
};

const sampleComments = [
  { _id: 1, threadId: '1', content: 'First comment', author: 'Alice', date: new Date().toISOString() },
  { _id: 2, threadId: '1', content: 'Second comment', author: 'Bob', date: new Date().toISOString() },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ThreadDetail: UI test cases', () => {
  // UI test
  test('shows loading state', async () => {
    // Simulate fetch never resolves
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<ThreadDetail />, { route: '/threads/1', path: '/threads/:id' });
    expect(screen.getByText(/Loading thread/i)).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  // UI test
  test('shows error state', async () => {
    mockFetchOnce({}, false, 500); // thread fetch
    mockFetchOnce([], true);       // comments fetch
    renderWithRouter(<ThreadDetail />, { route: '/threads/1', path: '/threads/:id' });
    expect(await screen.findByText(/Error loading thread/i)).toBeInTheDocument();
  });

  // UI test
  test('shows thread not found', async () => {
    mockFetchOnce(null, true); // thread fetch returns null
    mockFetchOnce([], true);   // comments fetch
    renderWithRouter(<ThreadDetail />, { route: '/threads/1', path: '/threads/:id' });
    await waitFor(() => expect(screen.getByText(/Thread not found/i)).toBeInTheDocument());
  });

  // UI test
  test('renders thread and comments', async () => {
    mockFetchOnce(sampleThread, true); // thread fetch
    mockFetchOnce(sampleComments, true); // comments fetch
    renderWithRouter(<ThreadDetail />, { route: '/threads/1', path: '/threads/:id' });
    expect(await screen.findByText('Test Thread')).toBeInTheDocument();
    expect(screen.getByText('Thread content')).toBeInTheDocument();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
  });

  // UI test
  test('shows no comments message', async () => {
    mockFetchOnce(sampleThread, true);
    mockFetchOnce([], true);
    renderWithRouter(<ThreadDetail />, { route: '/threads/1', path: '/threads/:id' });
    expect(await screen.findByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
  });

  // UI test
  test('opens and closes comment form', async () => {
    mockFetchOnce(sampleThread, true);
    mockFetchOnce(sampleComments, true);
    renderWithRouter(<ThreadDetail />, { route: '/threads/1', path: '/threads/:id' });
    await screen.findByText('Test Thread');
    fireEvent.click(screen.getByRole('button', { name: /comment/i }));
    expect(screen.getByPlaceholderText(/Write a comment/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByPlaceholderText(/Write a comment/i)).not.toBeInTheDocument();
  });

  // UI test
  test('validates empty comment form', async () => {
    mockFetchOnce(sampleThread, true);
    mockFetchOnce(sampleComments, true);
    renderWithRouter(<ThreadDetail />, { route: '/threads/1', path: '/threads/:id' });
    await screen.findByText('Test Thread');
    fireEvent.click(screen.getByRole('button', { name: /comment/i }));
    fireEvent.click(screen.getByRole('button', { name: /Post comment/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Content is required/i);
  });
});

describe('ThreadDetail: Integration test cases', () => {
  // Integration test
  test('posts a new comment and refreshes', async () => {
    mockFetchOnce(sampleThread, true); // thread fetch
    mockFetchOnce(sampleComments, true); // comments fetch
    renderWithRouter(<ThreadDetail />, { route: '/threads/1', path: '/threads/:id' });
    await screen.findByText('Test Thread');
    fireEvent.click(screen.getByRole('button', { name: /comment/i }));
    fireEvent.change(screen.getByPlaceholderText(/Write a comment/i), { target: { value: 'A new comment' } });
    const newComment = { _id: 3, threadId: '1', content: 'A new comment', author: 'Good Commenter', date: new Date().toISOString() };
    mockFetchOnce(newComment, true); // POST
    mockFetchOnce([...sampleComments, newComment], true); // refresh comments
    fireEvent.click(screen.getByRole('button', { name: /Post comment/i }));
    await waitFor(() => expect(screen.queryByPlaceholderText(/Write a comment/i)).not.toBeInTheDocument());
    expect(await screen.findByText('A new comment')).toBeInTheDocument();
  });
});

// Unit test for handleChange logic
function useForm() {
  const [form, setForm] = useState({ content: '' });
  const handleChange = (e: { target: { name: string; value: string } }) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  return { form, handleChange };
}

describe('ThreadDetail: Unit test cases', () => {
  test('updates form state', () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.handleChange({ target: { name: 'content', value: 'abc' } });
    });
    expect(result.current.form.content).toBe('abc');
  });
});