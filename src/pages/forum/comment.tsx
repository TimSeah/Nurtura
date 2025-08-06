import React from "react";
import { parseISO, formatDistanceToNow } from 'date-fns';
import { comment } from "postcss";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

interface CommentDetail{
    _id: number;
    threadId: string;
    content: string;
    author: string;
    date: string;
}

interface CommentDetailProps {
    comment: CommentDetail;
    onDelete: (id:number) => void;
}

const Comment: React.FC<CommentDetailProps> = ({ comment, onDelete}) => {
  const { user } = useContext(AuthContext);

  const handleDeleteComment = async (id: number) => {
    if (comment.author !== user?.username) return;
    if (!window.confirm("Are you sure you want to delete this Comment?")) return;

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());

      onDelete(comment._id);
    } catch (err: any) {
      console.error("Failed to delete thread:", err);
      alert(`Failed to delete thread: ${err.message}`);
    }
  };

    return (
        <article className="p-6 text-base bg-white rounded-lg">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 text-left text-sm text-gray-500 dark:text-gray-400">
                    <div>
                        By <span className="font-medium text-gray-700">{comment.author}</span> {formatDistanceToNow(parseISO(comment.date), { addSuffix: true })}
                    </div>

                    <div className="text-gray-500 mt-1">
                        {comment.content}
                    </div >
                </div>

            {comment.author === user?.username && ( // updated logic to check if current user is author, fixes bug where delete button does not appear
            <div className="ml-2">
                <button
                className="mt-2 -ml-3 text-red-500 hover:text-red-700 transition min-w-[48px] flex justify-center"
                title="Delete Thread"
                onClick={() => {
                    handleDeleteComment(comment._id);
                }}
                >
                <svg
                    className="w-5 h-8 mr-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M9 3V4H4V6H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V6H20V4H15V3H9ZM7 6H17V20H7V6ZM9 8V18H11V8H9ZM13 8V18H15V8H13Z" />
                </svg>
                </button>
            </div>
            )}
    
            </div>
        </article>
    );
}

export default Comment;