import React, { use, useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import "./forum.css";

interface Thread {
  _id: number;
  title: string;
  content: string;
  date: string;
  upvotes: number;
};

const Forum: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });

  useEffect(() => {
    fetch("/api/threads")
    .then(res => {
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then((data: Thread[]) => {
      setThreads(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch threads:", err);
      setError(err.message);
      setLoading(false);
    });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      setError("Title and content are required.");
      return;
    }

    try{
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          title: form.title, 
          content: form.content,
          date: new Date().toISOString(),
          upvotes: 0,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      const newThread: Thread = await res.json();

      setThreads(prev => [...prev, newThread]);
      setForm({ title: "", content: "" });
    }catch (err: any) {
        console.error("Failed to create thread:", err);
        alert(`Failed to create thread: ${err}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading threads...</div>;
  }

  if (error) {
    return <div className="error">Error loading threads: {error}</div>;
  }

  return (
    <div className="forum-container">
      <h1>Forum</h1>
      
      <form className="new-thread-form" onSubmit={handleSubmit}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Thread title"
          required
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Thread content"
          required
        />
        <button type="submit">Post Thread</button>
      </form>
      {threads.length === 0 ? <p>No threads yet</p> : threads.map(
        (t => (
          <div key={t._id} className="thread">
            <h2>{t.title}</h2>
            <p>{t.content}</p>
            <p className="thread-meta">
              Posted on {new Date(t.date).toLocaleDateString()} | Upvotes: {t.upvotes}
            </p>
          </div>
        ))
      )}
    </div>
    )
  };

export default Forum;