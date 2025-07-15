import "./forum.css";
import "./forum"
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { calculateDaysAgo } from "./utils";
import { useParams } from "react-router-dom";
import ThreadPost from "./threadPost";

interface ThreadDetail{
  _id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  upvotes: number;
  replies: number;
}

const ThreadDetail: React.FC = () => {
    const [thread, setThread] = useState<ThreadDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const [showForm, setShowForm] = useState(false);

    const fetchThread = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/threads/${id}`);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data: ThreadDetail = await res.json();
            setThread(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (id) {
            fetchThread(id);
        }
    }, [id]);

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
                {/* --- Thread Header --- */}
                <ThreadPost 
                thread={thread} 
                onCommentClick={() => setShowForm(prev => !prev)}
                />
                
                {/* --- Post Comment --- */}
                <section className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">Comments</h2>
                    {showForm && (
                        <form className="flex flex-col space-y-4">
                            <textarea
                            id="comment"
                            rows={4}
                            className="w-full px-4 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="Write a comment…"
                            required
                            />
                            <button
                            type="submit"
                            className="self-end px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            >
                                Post comment
                            </button>
                        </form>
                    )}
                </section>
                {/* --- Comments Section --- */}
            </div>
        </div>
    );
}

export default ThreadDetail;