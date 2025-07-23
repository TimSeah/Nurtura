import React from 'react';
import { render, screen } from '@testing-library/react';
import Comment from '../src/pages/forum/Comment';
import * as calDaysAgoUtil from '../src/utils/calDaysAgoUtil';
import { afterEach, describe, test, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock calculateDaysAgo
vi.spyOn(calDaysAgoUtil, 'calculateDaysAgo').mockImplementation(() => '5 days ago');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const comment = {
  _id: 1,
  threadId: 'thread-1',
  content: 'This is a comment.',
  author: 'Bob',
  date: '2023-06-01',
};

describe('Comment: UI test cases', () => {
  test('renders all comment fields correctly', () => {
    render(<Comment comment={comment} />);
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('This is a comment.')).toBeInTheDocument();
    expect(screen.getByText(/5 days ago/i)).toBeInTheDocument();
  });

  test('renders correct structure and classes', () => {
    render(<Comment comment={comment} />);
    const article = screen.getByRole('article');
    expect(article).toHaveClass('p-6', 'text-base', 'bg-white', 'rounded-lg');
    expect(screen.getByText('This is a comment.')).toHaveClass('text-gray-500', 'text-left');
  });

  test('renders author and content as plain text', () => {
    render(<Comment comment={comment} />);
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('This is a comment.')).toBeInTheDocument();
  });
});

describe('Comment: Integration test cases', () => {
  test('integrates with calculateDaysAgo utility', () => {
    render(<Comment comment={comment} />);
    expect(calDaysAgoUtil.calculateDaysAgo).toHaveBeenCalledWith('2023-06-01');
  });
});
