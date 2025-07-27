import "./Forum.css";
import "./Forum"
import { useState, useEffect,useContext, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import ThreadPost from "./threadPost";
import Comment from "./comment";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
    //const [upvotes, setUpvotes] = useState<number>(0); //useState, dont need it?(thread?.upvotes ?? 0); THIS WAS WORKING
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
    const { user } = useContext(AuthContext);

    //Original
    /*
    const fetchThread = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/threads/${id}`, {
  credentials: 'include'
})
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data: ThreadDetail = await res.json();
            setThread(data);
            setUserVote(data.userVote);
            //setUpvotes(data.upvotes);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    */

    //Current Implementation Suggestion
    const fetchThread = async (id: string) => {
    console.log('Frontend: fetchThread called for ID:', id);
    setLoading(true);
    try {
        const res = await fetch(`http://localhost:5000/api/threads/${id}`, {
            credentials: 'include'
        });
        
        console.log('Response status:', res.status);
        
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        
        const data: ThreadDetail = await res.json();
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
    }
};

//  useEffect to log when userVote changes
useEffect(() => {
    console.log('userVote state changed to:', userVote);
}, [userVote]);

//  useEffect to log when thread changes
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
            const res = await fetch(`http://localhost:5000/api/threads/${threadId}/comments`, {
  credentials: 'include'
})
            
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





// THIS WAS THE WORKING REDDIT HANDLEVOTE !!!!!!!
/*
const handleVote = async (direction: 'up' | 'down') => {
  if (!thread || !user) return;

  let actualDirection: 'up' | 'down' | 'cancel' = direction;
  let voteDelta = 0;

  if (userVote === direction) {
    // Cancelling the same vote
    actualDirection = 'cancel';
    voteDelta = direction === 'up' ? -1 : +1;
    setUserVote(null);
  } else if (userVote === 'up' && direction === 'down') {
    // Switching from up to down
    voteDelta = -2;
    setUserVote('down');
  } else if (userVote === 'down' && direction === 'up') {
    // Switching from down to up
    voteDelta = +2;
    setUserVote('up');
  } else if (userVote === null) {
    // First time voting
    voteDelta = direction === 'up' ? +1 : -1;
    setUserVote(direction);
  }

  try {
  const res = await fetch(`http://localhost:5000/api/threads/${thread._id}/vote`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction: actualDirection }),
  });

  if (!res.ok) throw new Error(await res.text());

  const updated = await res.json();

  // Apply local optimistic update (optional)
  let voteDelta = 0;
  if (actualDirection === 'cancel') {
    voteDelta = userVote === 'up' ? -1 : 1;
  } else {
    if (userVote === null) {
      voteDelta = direction === 'up' ? 1 : -1;
    } else if (userVote === 'up' && direction === 'down') {
      voteDelta = -2;
    } else if (userVote === 'down' && direction === 'up') {
      voteDelta = 2;
    }
  }

  setThread(prev =>
    prev
      ? { ...prev, upvotes: updated.upvotes, userVote: updated.userVote }
      : null
  );
} catch (err) {
  console.error("Vote failed:", err);
  alert("Vote failed");
}
};
*/

//Current Implementation Suggestion
const handleVote = async (direction: 'up' | 'down') => {
  if (!thread || !user) return;

  console.log('Frontend: Vote clicked', direction);
  console.log('Current userVote:', userVote);
  console.log('Current upvotes:', thread.upvotes);

  try {
    const res = await fetch(`http://localhost:5000/api/threads/${thread._id}/vote`, {
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
    
  } catch (err) {
    console.error(" Vote failed:", err);
    alert(`Vote failed: ${err.message}`);
  }
};



      
    /*
    const updated = await res.json();
    setUpvotes(updated.upvotes);
    setUserVote(updated.userVote); // This will now be null if vote was retracted
  } catch (err) {
    console.error("Vote failed:", err);
    alert("Vote failed");
  }
};


   /* was working before
    useEffect(() => {
        if (thread) {
            setUpvotes(thread.upvotes);
            //if (thread?.userVote) {
                 //setUserVote(thread.userVote);
               // }
        }
    }, [thread]);
    */


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.content) {
            setFormError("Content is required.");
            return;
        }
        if (!user) {
            alert("You must be logged in to comment.");
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/threads/${id}/comments`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    threadId: id,
                    content: form.content,
                    author: user.username, // To be replaced with actual user
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
                upvotes={thread.upvotes}
                onVote={handleVote}
                userVote={userVote}
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