import React from "react";
import { ArrowUpIcon, ChatBubbleBottomCenterIcon, ArrowDownIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { parseISO, formatDistanceToNow } from 'date-fns';

interface ThreadDetail {
    _id: number;
    title: string;
    content: string;
    author: string;
    date: string;
    upvotes: number;
    replies: number;
    userVote: 'up' | 'down' | null;
}

interface ThreadDetailProps {
    thread: ThreadDetail;
    upvotes: number;
    onVote: (direction: 'up' | 'down') => void;
    onCommentClick: () => void;
    userVote: 'up' | 'down' | null;
}

const ThreadPost: React.FC<ThreadDetailProps> = ({
    thread,
    upvotes,
    onVote,
    onCommentClick,
    userVote
}) => {
    const handleCopyLink = () => {
        const threadUrl = new URL(window.location.href);
        navigator.clipboard.writeText(threadUrl.toString());
        alert("Thread link copied to clipboard!");
    };

    return (
        <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
            {/* Header */}
            <header className="mb-4">
                <h1 className="text-2xl font-semibold text-gray-900 text-left">
                    {thread.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>
                        By <span className="font-medium text-gray-700">{thread.author}</span> {formatDistanceToNow(parseISO(thread.date), { addSuffix: true })}
                    </span>
                </div>
            </header>
            {/* Body */}
            <section className="prose prose-sm text-gray-800 mb-6 text-left">
                {thread.content}
            </section>

            {/* Footer (actions) */}
            <footer className="flex items-center space-x-1 text-gray-600">

                <button
                    onClick={() => onVote('up')}
                    className="flex items-center space-x-1 transition group"
                    aria-label="Upvote"
                >
                    <ArrowUpIcon
                        className={`w-5 h-5 transition-colors ${userVote === 'up' ? 'text-green-600' : 'group-hover:text-green-600'
                            }`}
                    />
                    <span className="text-gray-600">{upvotes}</span>
                </button>


                <button
                    onClick={() => onVote('down')}
                    className="flex items-center space-x-1 transition group"
                    aria-label="Downvote"
                >
                    <ArrowDownIcon
                        className={`w-5 h-5 transition-colors ${userVote === 'down' ? 'text-red-600' : 'group-hover:text-red-600'
                            }`}
                    />
                </button>

                <button
                    onClick={onCommentClick}
                    className="ml-6 flex items-center space-x-1 hover:text-blue-600 transition"
                    aria-label="Add Comment"
                >
                    <ChatBubbleBottomCenterIcon className="w-5 h-5" />
                    <span>Comment</span>
                </button>
                <button
                    onClick={handleCopyLink}
                    className="ml-6 flex items-center space-x-1 hover:text-gray-600 transition-colors p-1"
                    title="Copy Link to Thread"
                >
                    <ClipboardDocumentIcon className="w-5 h-5" />
                    <span>Share</span>
                </button>
            </footer>
        </article>
    );
}

export default ThreadPost;
