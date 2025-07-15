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
    
    return <ThreadPost thread={thread} />;
}

export default ThreadDetail;