import "./forum.css";
import { useState, useEffect,useContext, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import ThreadPost from "./threadPost";
import Comment from "./comment";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

interface ThreadDetail{
    _id: number;
    title: string;
    content: string;
    author: string;
    date: string;
    upvotes: number;
    replies: number;
    userVote: 'up' | 'down' | null;
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
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
    const { user } = useContext(AuthContext);

    const fetchThread = async (id: string) => {
    console.log('Frontend: fetchThread called for ID:', id);
    setLoading(true);
    try {
        const res = await fetch(`/api/threads/${id}`, {
            credentials: 'include'
        });
        
        console.log('Response status:', res.status);
        
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        
        const data: ThreadDetail = await res.json();
        if (!data) {
            setThread(null);
            return;
        }
        console.log('Received thread data:', data);
        console.log('User vote from backend:', data.userVote);
        console.log('Upvotes from backend:', data.upvotes);
        
        setThread(data);
        setUserVote(data.userVote);
        console.log('Frontend state updated');
        console.log('Local userVote state set to:', data.userVote);
    } catch (e: any) {
        console.error('Error fetching thread:', e);
        setError(e.message);
    } finally {
        setLoading(false);
    }};
    
    // useEffect to log when userVote changes
    useEffect(() => {
        console.log('userVote state changed to:', userVote);
    }, [userVote]);
    
    // useEffect to log when thread changes
    useEffect(() => {
        if (thread) {
            console.log(' thread state changed:', {
                title: thread.title,
                upvotes: thread.upvotes,
                userVote: thread.userVote
            });
        }
    }, [thread]);
    
    const fetchComments = async (threadId: string) => {
        try {
            const res = await fetch(`/api/threads/${threadId}/comments`, {
                credentials: 'include'
            })
            
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data = await res.json();
            setComments(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }};
        
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
    if (!thread || !user) return;

    console.log('Frontend: Vote clicked', direction);
    console.log('Current userVote:', userVote);
    console.log('Current upvotes:', thread.upvotes);

    try {
        const res = await fetch(`/api/threads/${thread._id}/vote`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
        });

        if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${errorText}`);
        }

        const updated = await res.json();
        console.log('Backend response:', updated);
        
        // Update both thread state and local userVote state with backend response
        setThread(prev =>
        prev
            ? { ...prev, upvotes: updated.upvotes, userVote: updated.userVote }
            : null
        );
        setUserVote(updated.userVote);
        
        console.log('Frontend state updated');
        console.log('New userVote:', updated.userVote);
        console.log('New upvotes:', updated.upvotes);
        
    } catch (err: any) {
        console.error(" Vote failed:", err);
        alert(`Vote failed: ${err.message}`);
    }};

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear form error when user starts typing
        if (formError) {
            setFormError(null);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmittingComment(true);

        if (!form.content.trim()) {
            setFormError("Please write a comment before posting.");
            setIsSubmittingComment(false);
            return;
        }
        
        if (!user) {
            setFormError("You must be logged in to comment.");
            setIsSubmittingComment(false);
            return;
        }

        try {
            const res = await fetch(`/api/threads/${id}/comments`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    threadId: id,
                    content: form.content,
                    author: user.username,
                    date: new Date().toISOString()
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorMessage = "Failed to post comment";
                
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.code === 'CONTENT_MODERATED') {
                        // Handle moderation error with user-friendly message
                        setFormError(errorData.message);
                    } else {
                        setFormError(errorData.message || errorMessage);
                    }
                } catch {
                    // Fallback for non-JSON errors
                    setFormError(errorText || errorMessage);
                }
                
                setIsSubmittingComment(false);
                return;
            }

            const newComment: CommentDetail = await res.json();
            setComments(prev => [...prev, newComment]);
            setForm({ content: "" });
            setFormError(null);
            setShowForm(false);
            await fetchComments(id!);
        } catch (err: any) {
            console.error("Failed to post comment:", err);
            setFormError("Network error. Please check your connection and try again.");
        } finally {
            setIsSubmittingComment(false);
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
                <div className="mb-4 flex items-center space-x-2 text-teal-600 hover:text-teal-800 cursor-pointer" onClick={() => navigate("/forum")}>
                {/* <ArrowLeftIcon className="w-5 h-5" /> */}
                <span className="text-[20px] font-large"> &lt; Back to Forum</span>
                </div>
                {/* --- Thread Header --- */}
                <ThreadPost 
                thread={thread} 
                upvotes={thread.upvotes}
                onVote={handleVote}
                userVote={userVote}
                onCommentClick={() => {
                    setShowForm(prev => !prev);
                    if (!showForm) {
                        // Clear errors when opening the form
                        setFormError(null);
                        setForm({ content: "" });
                    }
                }}
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
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{formError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormError(null);
                                        setForm({ content: "" });
                                    }}
                                    disabled={isSubmittingComment}
                                    className="self-end px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingComment}
                                    className="self-end px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isSubmittingComment && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    <span>{isSubmittingComment ? 'Posting...' : 'Post comment'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                    {/* --- Comments List --- */}
                    <div className="mt-6 space-y-4">
                        {comments.length > 0 ? (
                            comments.map((c) => (
                                <Comment 
                                key={c._id} 
                                comment={c}
                                onDelete={handlecommentDelete => {
                                    setComments(prev => prev.filter(comment => comment._id !== handlecommentDelete));
                                }}
                                 />
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