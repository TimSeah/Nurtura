import React from "react";
import { calculateDaysAgo } from "./utils";
import { ArrowUpIcon, ChatBubbleBottomCenterIcon } from '@heroicons/react/24/outline';

interface ThreadDetail{
    _id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  upvotes: number;
  replies: number;
}

interface ThreadDetailProps {
  thread: ThreadDetail;
  onCommentClick: () => void;
}

const ThreadPost: React.FC<ThreadDetailProps> = ({ thread, onCommentClick }) => {
    return (
    <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        {/* Header */}
        <header className="mb-4">
            <h1 className="text-2xl font-semibold text-gray-900 text-left">
                {thread.title}
            </h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
                <span>
                    By <span className="font-medium text-gray-700">{thread.author}</span>
                </span>
            </div>
        </header>
        {/* Body */}
        <section className="prose prose-sm text-gray-800 mb-6 text-left">
            {thread.content}
        </section>
        
        {/* Footer (actions) */}
        <footer className="flex items-center space-x-6 text-gray-600">
            <button 
            className="flex items-center space-x-1 hover:text-blue-600 transition"
            aria-label="Upvote"
            >
                <ArrowUpIcon className="w-5 h-5" />
                <span>
                    {thread.upvotes}
                </span>
            </button>
            <button
            onClick={onCommentClick}
            className="flex items-center space-x-1 hover:text-blue-600 transition"
            aria-label="Add Comment"
            >
                <ChatBubbleBottomCenterIcon className="w-5 h-5" />
                <span>Comment</span>
            </button>
        </footer>
    </article>
    );
}

export default ThreadPost;
