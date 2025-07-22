import React from "react";
import { calculateDaysAgo } from "../../utils/calDaysAgoUtil";

interface CommentDetail{
    _id: number;
    threadId: string;
    content: string;
    author: string;
    date: string;
}

interface CommentDetailProps {
    comment: CommentDetail;
}

const Comment: React.FC<CommentDetailProps> = ({ comment }) => {
    return (
        <article className="p-6 text-base bg-white rounded-lg">
            <footer className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    By <span className="font-medium text-gray-700">{comment.author}</span> {calculateDaysAgo(comment.date)}
                </div>
            </footer>
            <p className="text-gray-500 text-left">
                {comment.content}
            </p>
        </article>
    );
}

export default Comment;