import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThreadPost from '../src/pages/forum/ThreadPost';
import * as calDaysAgoUtil from '../src/utils/calDaysAgoUtil';
import { afterEach, describe, test, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';


// Mock icons to avoid SVG issues
vi.mock('@heroicons/react/24/outline', () => ({
  ArrowUpIcon: () => <svg data-testid="ArrowUpIcon" />,
  ChatBubbleBottomCenterIcon: () => <svg data-testid="ChatBubbleBottomCenterIcon" />,
}));

// Mock calculateDaysAgo
vi.spyOn(calDaysAgoUtil, 'calculateDaysAgo').mockImplementation(() => '3 days ago');

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
};

describe('ThreadPost: UI test cases', () => {

  test('renders all thread fields correctly', () => {
    render(<ThreadPost thread={thread} onCommentClick={vi.fn()} />);
    expect(screen.getByText('Sample Thread')).toBeInTheDocument();
    expect(screen.getByText('This is a sample thread content.')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/3 days ago/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('renders icons and correct structure', () => {
    render(<ThreadPost thread={thread} onCommentClick={vi.fn()} />);
    expect(screen.getByTestId('ArrowUpIcon')).toBeInTheDocument();
    expect(screen.getByTestId('ChatBubbleBottomCenterIcon')).toBeInTheDocument();
    const article = screen.getByRole('article');
    expect(article).toHaveClass('max-w-3xl', 'mx-auto', 'bg-white', 'rounded-2xl', 'shadow', 'p-6');
  });
});

describe('ThreadPost: Unit test cases', () => {
  test('calls onCommentClick when comment button is clicked', () => {
    const onCommentClick = vi.fn();
    render(<ThreadPost thread={thread} onCommentClick={onCommentClick} />);
    fireEvent.click(screen.getByLabelText('Add Comment'));
    expect(onCommentClick).toHaveBeenCalledTimes(1);
  });
});

describe('ThreadPost: Integration test cases', () => {
  test('integrates with calculateDaysAgo utility', () => {
    render(<ThreadPost thread={thread} onCommentClick={vi.fn()} />);
    expect(calDaysAgoUtil.calculateDaysAgo).toHaveBeenCalledWith('2023-06-01');
  });
});
