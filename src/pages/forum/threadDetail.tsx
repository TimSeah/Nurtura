import "./Forum.css";
import "./Forum"
import { useState, useEffect, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import ThreadPost from "./ThreadPost";
import Comment from "./Comment";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ThreadDetail{
    _id: number;
    title: string;
    content: string;
    author: string;
    date: string;
    upvotes: number;
    replies: number;
}

interface CommentDetail {
    _id: number;
    threadId: string;
    content: string;
    author: string;
    date: string;
}

const ThreadDetail: React.FC = () => {
    const navigate = useNavigate();
    const [thread, setThread] = useState<ThreadDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const [showForm, setShowForm] = useState(false);
    const [comments, setComments] = useState<CommentDetail[]>([]);
    const [form, setForm] = useState({ content: "" });
    const [formError, setFormError] = useState<string | null>(null);
    const [upvotes, setUpvotes] = useState(thread?.upvotes ?? 0);


    const fetchThread = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/threads/${id}`);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data: ThreadDetail = await res.json();
            setThread(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (threadId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/threads/${threadId}/comments`);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data = await res.json();
            setComments(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (id) {
            (async () => {
                setLoading(true);
                await Promise.all([fetchThread(id), fetchComments(id)]);
                setLoading(false);
            })();
        }
    }, [id]);

    const handleVote = async (direction: 'up' | 'down') => {
         if (!thread) return; // Prevents fetch if thread is still null
         console.log("Voting thread ID:", thread?._id);
        try {
             const res = await fetch(`http://localhost:5000/api/threads/${thread._id}/vote`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ direction }),
    });

    if (!res.ok) throw new Error(await res.text());
        const updated = await res.json();
        setUpvotes(updated.upvotes);
  } catch (err) {
    console.error("Vote failed:", err);
    alert("Vote failed");
  }
};

    useEffect(() => {
        if (thread) {
            setUpvotes(thread.upvotes);
        }
    }, [thread]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.content) {
            setFormError("Content is required.");
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/threads/${id}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    threadId: id,
                    content: form.content,
                    author: "good commenter", // To be replaced with actual user
                    date: new Date().toISOString()
                }),
            });
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const newComment: CommentDetail = await res.json();
            setComments(prev => [...prev, newComment]);
            setForm({ content: "" });
            setShowForm(false);
            await fetchComments(id!);
        } catch (e: any) {
            setError(e.message);
        }
    }

    if (loading) {
      return <div className="loading">Loading thread...</div>;
    }
    
    if (error) {
      return <div className="error">Error loading thread: {error}</div>;
    }

    if (!thread) {
        return <div className="error">Thread not found.</div>;
    }
    
    return (
        <div className="min-h-screen bg-gray-50 antialiased">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-4 flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => navigate(-1)}>
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Forum</span>
                </div>
                {/* --- Thread Header --- */}
                <ThreadPost 
                thread={thread} 
                upvotes={upvotes}
                onVote={handleVote}
                onCommentClick={() => setShowForm(prev => !prev)}
                />
                
                {/* --- Comments Section --- */}
                <section className="mt-8">
                    {/* --- Post Comment --- */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">Comments</h2>
                    {showForm && (
                        <form onSubmit={handleSubmit} noValidate className="flex flex-col space-y-4">
                            <textarea
                            id="content"
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="Write a comment…"
                            required
                            />
                            {formError && (
                                <p role="alert" className="text-red-600 text-sm">{formError}</p>
                            )}
                            <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowForm(false)} className="self-end px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                            type="submit"
                            className="self-end px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            >
                                Post comment
                            </button>
                            </div>
                        </form>
                    )}
                    {/* --- Comments List --- */}
                    <div className="mt-6 space-y-4">
                        {comments.length > 0 ? (
                            comments.map((c) => (
                                <Comment key={c._id} comment={c} />
                            ))
                        ) : (
                            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ThreadDetail;