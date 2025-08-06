import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import Forum from '../../src/pages/forum/forum';
import { renderWithRouter } from './utils';
import { mockFetchOnce } from './mockFetch';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AuthContext, AuthContextType } from '../../src/contexts/AuthContext';

const now = new Date();
const sampleThreads = [
  { _id: 1, title: 'Hello', content: 'World', author: 'A good grandkid', date: now.toISOString(), upvotes: 3, replies: 0 },
  { _id: 2, title: 'Other', content: 'Thing', author: 'Someone else',    date: new Date(now.getTime() - 100000).toISOString(), upvotes: 1, replies: 2 },
  { _id: 3, title: 'Oldest Thread', content: 'Old', author: 'A good grandkid', date: new Date(now.getTime() - 10000000).toISOString(), upvotes: 0, replies: 1 },
  { _id: 4, title: 'Popular', content: 'Hot', author: 'Another', date: new Date(now.getTime() - 5000000).toISOString(), upvotes: 100, replies: 10 },
];

const mockAuth: AuthContextType  = {
  user: { username: 'A good grandkid'},
  login: vi.fn(),
  logout: vi.fn(),
  loading: false
};

const mockAuthOther: AuthContextType = {
  user: { username: 'NotAuthor'},
  login: vi.fn(),
  logout: vi.fn(),
  loading: false
};

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

  test('filters “My Threads” by username', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <Forum />
      </AuthContext.Provider>
    );
    await screen.findByText('Hello');
    fireEvent.click(screen.getByRole('button', { name: /My Threads/i }));
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Oldest Thread')).toBeInTheDocument();
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
    expect(screen.queryByText('Popular')).not.toBeInTheDocument();
  });

  
  test('shows "No threads yet" when empty', async () => {
    mockFetchOnce([]);
    renderWithRouter(<Forum />);
    expect(await screen.findByText('No threads yet')).toBeInTheDocument();
  });

  test('validates form when empty', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');
    fireEvent.click(screen.getByRole('button', { name: /\+ New Thread/i }));
    fireEvent.click(screen.getByRole('button', { name: /Create Thread/i }));
    expect(screen.getByText(/Please fill in all fields/i)).toBeInTheDocument();
  });

  test('validates form with only title', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');
    fireEvent.click(screen.getByRole('button', { name: /\+ New Thread/i }));
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Only Title' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Thread/i }));
    expect(screen.getByText(/Please fill in all fields/i)).toBeInTheDocument();
  });

  test('validates form with only content', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');
    fireEvent.click(screen.getByRole('button', { name: /\+ New Thread/i }));
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'Only Content' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Thread/i }));
    expect(screen.getByText(/Please fill in all fields/i)).toBeInTheDocument();
  });

  test('posts new thread & refreshes', async () => {
    mockFetchOnce(sampleThreads);                    // initial GET
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');
    fireEvent.click(screen.getByRole('button', { name: /\+ New Thread/i }));
    fireEvent.change(screen.getByLabelText(/Title/i),   { target: { value: 'New T' } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'Body' } });
    const created = { ...sampleThreads[0], _id: 99, title: 'New T', content: 'Body' };
    mockFetchOnce(created);                           // POST
    mockFetchOnce([...sampleThreads, created]);       // refresh GET
    fireEvent.click(screen.getByRole('button', { name: /Create Thread/i }));
    await waitFor(() => expect(screen.queryByText(/Create New Thread/i)).not.toBeInTheDocument());
    expect(await screen.findByText('New T')).toBeInTheDocument();
  });

  test('sorts by most recent', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');
    fireEvent.change(screen.getByDisplayValue('Most Recent'), { target: { value: 'recent' } });
    const titles = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);
    expect(titles[0]).toBe('Hello'); // most recent
  });

  test('sorts by oldest', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');
    fireEvent.change(screen.getByDisplayValue('Most Recent'), { target: { value: 'oldest' } });
    const titles = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);
    expect(titles[titles.length - 1]).toBe('Hello'); // most recent is now last
  });

  test('sorts by most comments', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');
    fireEvent.change(screen.getByDisplayValue('Most Recent'), { target: { value: 'comments' } });
    const titles = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);
    expect(titles[0]).toBe('Popular'); // most comments
  });

  test('sorts by most upvotes', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(<Forum />);
    await screen.findByText('Hello');
    fireEvent.change(screen.getByDisplayValue('Most Recent'), { target: { value: 'likes' } });
    const titles = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);
    expect(titles[0]).toBe('Popular'); // most upvotes
  });

  test('delete button only for author (username)', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(
      <AuthContext.Provider value={{ ...mockAuth, user: { username: 'A good grandkid' } }}>
        <Forum />
      </AuthContext.Provider>
    );
    await screen.findByText('Hello');
    // Should see delete for own thread
    expect(screen.getAllByTitle('Delete Thread').length).toBeGreaterThan(0);
    // Should not see delete for threads not authored by user
    expect(screen.queryByText('Popular')).toBeInTheDocument();
  });

  test('delete button not shown for non-author', async () => {
    mockFetchOnce(sampleThreads);
    renderWithRouter(
      <AuthContext.Provider value={mockAuthOther}>
        <Forum />
      </AuthContext.Provider>
    );
    await screen.findByText('Hello');
    expect(screen.queryByTitle('Delete Thread')).not.toBeInTheDocument();
  });

  test('delete thread: confirm and cancel', async () => {
    mockFetchOnce(sampleThreads);
    window.confirm = vi.fn(() => false); // cancel
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <Forum />
      </AuthContext.Provider>
    );
    await screen.findByText('Hello');
    fireEvent.click(screen.getAllByTitle('Delete Thread')[0]);
    expect(window.confirm).toHaveBeenCalled();
    // Now confirm
    window.confirm = vi.fn(() => true);
    mockFetchOnce({}, true, 200); // DELETE
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <Forum />
      </AuthContext.Provider>
    );
    await screen.findByText('Hello');
    fireEvent.click(screen.getAllByTitle('Delete Thread')[0]);
    expect(window.confirm).toHaveBeenCalled();
  });

  test('boundary: upvotes and replies at 0 and high values', async () => {
    const threads = [
      { _id: 10, title: 'First', content: 'None', author: 'A good grandkid', date: now.toISOString(), upvotes: 0, replies: 9999 },
      { _id: 11, title: 'Second', content: 'Lots', author: 'A good grandkid', date: now.toISOString(), upvotes: 9999, replies: 0 },
    ];
    mockFetchOnce(threads);
    renderWithRouter(<Forum />);
    const zeroLink = (await screen.findByText('First')).closest('a')!;
    const zero = within(zeroLink);
    expect(
      zero.getByTestId('upvotes')  // upvotes
    ).toHaveTextContent('0');
    expect(
      zero.getByTestId('replies')  // replies
    ).toHaveTextContent('9999');

    const maxLink = screen.getByText('Second').closest('a')!;
    const max = within(maxLink);
    expect(
      max.getByTestId('upvotes')  // upvotes
    ).toHaveTextContent('9999');
    expect(
      max.getByTestId('replies')  // replies
    ).toHaveTextContent('0');
  });
});

describe('Forum: Integration test cases', () => {
  // Integration test: clicking a thread navigates to thread detail page
  test('navigates to thread detail page on thread click', async () => {
    mockFetchOnce(sampleThreads);
    const { history } = renderWithRouter(<Forum />);
    await screen.findByText('Hello');
    const threadLink = screen.getByRole('link', { name: /Hello/i });
    fireEvent.click(threadLink);
    // Check that the URL changed to the thread detail page
    await waitFor(() =>
      expect(history.location.pathname).toBe('/threads/1')
    );
  });
});
