import { render, screen, fireEvent } from '@testing-library/react';
import ThreadPost from '../../src/pages/forum/threadPost';
import { afterEach, describe, test, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';


// Mock icons to avoid SVG issues
vi.mock('@heroicons/react/24/outline', () => ({
  ArrowUpIcon: () => <svg data-testid="ArrowUpIcon" />,
  ArrowDownIcon: () => <svg data-testid="ArrowDownIcon" />,
  ChatBubbleBottomCenterIcon: () => <svg data-testid="ChatBubbleBottomCenterIcon" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const thread = {
  _id: 1,
  title: 'Sample Thread',
  content: 'This is a sample thread content.',
  author: 'Alice',
  date: '2023-06-01',
  upvotes: 10,
  replies: 4,
  userVote: null
};

describe('ThreadPost: UI test cases', () => {
  test('renders all thread fields correctly', () => {
    render(<ThreadPost thread={thread} onCommentClick={vi.fn()} onVote={vi.fn()} upvotes={thread.upvotes} userVote={null} />);
    expect(screen.getByText('Sample Thread')).toBeInTheDocument();
    expect(screen.getByText('This is a sample thread content.')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/years ago/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('renders icons and correct structure', () => {
    render(<ThreadPost thread={thread} onCommentClick={vi.fn()} onVote={vi.fn()} upvotes={thread.upvotes} userVote={null} />);
    expect(screen.getByTestId('ArrowUpIcon')).toBeInTheDocument();
    expect(screen.getByTestId('ChatBubbleBottomCenterIcon')).toBeInTheDocument();
    const article = screen.getByRole('article');
    expect(article).toHaveClass('max-w-3xl', 'mx-auto', 'bg-white', 'rounded-2xl', 'shadow', 'p-6');
  });

  test('renders updated upvotes prop', () => {
    const { rerender } = render(<ThreadPost thread={thread} onCommentClick={vi.fn()} onVote={vi.fn()} upvotes={10} userVote={null} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    rerender(<ThreadPost thread={thread} onCommentClick={vi.fn()} onVote={vi.fn()} upvotes={15} userVote={null} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});

describe('ThreadPost: Unit test cases', () => {
  test('calls onCommentClick when comment button is clicked', () => {
    const onCommentClick = vi.fn();
    render(<ThreadPost thread={thread} onCommentClick={onCommentClick} onVote={vi.fn()} upvotes={thread.upvotes} userVote={null} />);
    fireEvent.click(screen.getByLabelText('Add Comment'));
    expect(onCommentClick).toHaveBeenCalledTimes(1);
  });

  test('calls onVote with "up" when upvote button is clicked', () => {
    const onVote = vi.fn();
    render(<ThreadPost thread={thread} onCommentClick={vi.fn()} onVote={onVote} upvotes={thread.upvotes} userVote={null} />);
    fireEvent.click(screen.getByLabelText('Upvote'));
    expect(onVote).toHaveBeenCalledWith('up');
  });

  test('calls onVote with "down" when downvote button is clicked', () => {
    const onVote = vi.fn();
    render(<ThreadPost thread={thread} onCommentClick={vi.fn()} onVote={onVote} upvotes={thread.upvotes} userVote={null} />);
    fireEvent.click(screen.getByLabelText('Downvote'));
    expect(onVote).toHaveBeenCalledWith('down');
  });
});
