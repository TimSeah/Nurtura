import React, { useEffect, useRef, useState, useContext } from "react";
import { parseISO, formatDistanceToNow } from "date-fns";
import { AuthContext } from "../../contexts/AuthContext";
import { ClipboardDocumentIcon, TrashIcon } from "@heroicons/react/24/outline";

interface CommentDetail {
    _id: number;
    threadId: string;
    content: string;
    author: string;
    date: string;
}

interface CommentDetailProps {
    comment: CommentDetail;
    onDelete: (id: number) => void;
}

const Comment: React.FC<CommentDetailProps> = ({ comment, onDelete }) => {
    const { user } = useContext(AuthContext);
    const commentRef = useRef<HTMLElement>(null);
    const [isHighlighted, setIsHighlighted] = useState(false);

    // Check if this comment should be highlighted based on URL hash
    useEffect(() => {
        const hash = window.location.hash;
        const commentId = `comment-${comment._id}`;

        if (hash === `#${commentId}`) {
            setIsHighlighted(true);

            // Scroll to the comment
            if (commentRef.current) {
                commentRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }

            // Remove highlight after a few seconds
            const timer = setTimeout(() => {
                setIsHighlighted(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [comment._id]);

    // Also listen for hash changes (if user navigates to different comment)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const commentId = `comment-${comment._id}`;

            if (hash === `#${commentId}`) {
                setIsHighlighted(true);
                if (commentRef.current) {
                    commentRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }

                const timer = setTimeout(() => {
                    setIsHighlighted(false);
                }, 3000);

                return () => clearTimeout(timer);
            }
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [comment._id]);

    const handleDeleteComment = async (id: number) => {
        if (comment.author !== user?.username) return;
        if (!window.confirm("Are you sure you want to delete this Comment?"))
            return;

        try {
            const res = await fetch(
                `/api/threads/${comment.threadId}/comments/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            if (!res.ok) throw new Error(await res.text());

            onDelete(comment._id);
        } catch (err: any) {
            console.error("Failed to delete comment:", err);
            alert(`Failed to delete comment: ${err.message}`);
        }
    };

    const handleCopyLink = () => {
        const url = new URL(window.location.href);
        url.hash = `comment-${comment._id}`;
        const commentUrl = url.toString();
        navigator.clipboard.writeText(commentUrl);
        alert("Comment link copied to clipboard!");
    };

    return (
        <article
            ref={commentRef}
            id={`comment-${comment._id}`}
            className={`p-6 text-base bg-white rounded-lg transition-all duration-300 ${isHighlighted
                    ? "ring-2 ring-blue-400 bg-blue-50 shadow-lg"
                    : "hover:shadow-sm"
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 text-left text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>
                            By{" "}
                            <span className="font-medium text-gray-700">
                                {comment.author}
                            </span>{" "}
                            {formatDistanceToNow(parseISO(comment.date), { addSuffix: true })}
                        </span>
                    </div>
                    <div className="text-gray-500 mt-1">{comment.content}</div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <button
                        onClick={handleCopyLink}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title="Copy Link to Comment"
                    >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                    </button>
                    {comment.author === user?.username && (
                        <button
                            className=" text-red-500 hover:text-red-700 transition p-1"
                            title="Delete Comment"
                            onClick={() => handleDeleteComment(comment._id)}
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};

export default Comment;