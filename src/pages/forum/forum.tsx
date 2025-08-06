import React, {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import "./forum.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { parseISO, formatDistanceToNow } from 'date-fns';

interface Thread {
  _id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  upvotes: number;
  replies: number;
}

const Forum: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [showUserThreads, setShowUserThreads] = useState(false);
  const [sortOption, setSortOption] = useState("recent");

  const sortedThreads = [...threads].sort((a, b) => {
    switch (sortOption) {
      case "likes":
        return b.upvotes - a.upvotes;
      case "comments":
        return (b.replies || 0) - (a.replies || 0); // fallback in case replies is undefined
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "recent":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const visibleThreads = showUserThreads
    ? sortedThreads.filter(
        (t) => t.author === user?.username
      ) // for "My Threads" button to work
    : sortedThreads;

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/threads", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setThreads(Array.isArray(data) ? data : []);
      console.log(threads);
    } catch (e: any) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear form error when user starts typing
    if (formError) {
      setFormError(null);
    }
  };

  console.log("Creating thread with author:", user?.username);
  console.log("Request payload:", {
    title: form.title,
    content: form.content,
    author: user?.username || "Anonymous",
    date: new Date().toISOString(),
    upvotes: 0,
  });
  console.log("user =", user);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          author: user?.username || "Anonymous",
          date: new Date().toISOString(),
          upvotes: 0,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Failed to create thread";
        
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
        
        setIsSubmitting(false);
        return;
      }
      
      const newThread: Thread = await res.json();

      setShowForm(false);
      setThreads((prev) => [...prev, newThread]);
      setForm({ title: "", content: "" });
      setFormError(null);

      await fetchThreads();
    } catch (err: any) {
      console.error("Failed to create thread:", err);
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const thread = threads.find((t) => t._id === id);
    if (thread?.author !== user?.username) return;
    if (!window.confirm("Are you sure you want to delete this thread?")) return;

    try {
      const res = await fetch(`/api/threads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());

      setThreads((prev) => prev.filter((thread) => thread._id !== id));
    } catch (err: any) {
      console.error("Failed to delete thread:", err);
      alert(`Failed to delete thread: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading threads...</div>;
  }

  if (loadError) {
    return <div className="error">Error loading threads: {loadError}</div>;
  }

  return (
    <>
      <div className="page-header">
        <h1>Forum</h1>
        <p>Ask questions to or help out another caregiver.</p>
      </div>
      <div className="max-w-5xl mx-auto px-4 bg-gray-50 min-h-screen">
        <div className="justify-between items-center mb-6">
          {/* <h1 className="text-3xl font-bold text-gray-800">Forum</h1> */}
          <div className="flex gap-4">
            <div className="relative w-max">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none ml-1 text-sm bg-green-100 h-13 px-2 pt-1 border border-gray-400 shadow-sm focus:border-green-800 rounded hover:shadow-md"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="comments">Most Comments</option>
              <option value="likes">Most Upvotes</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-7 -translate-y-1/2 text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
            </div>
            <div className="flex gap-4 ml-auto">
            <button
              onClick={() => setShowUserThreads((prev) => !prev)}
              className={`${
                showUserThreads
                  ? "bg-teal-700 hover:bg-teal-800"
                  : "bg-teal-700 hover:bg-teal-800"
              } text-sm text-white px-4 py-2 rounded-md shadow-sm transition hover:shadow-md`}
            >
              {showUserThreads ? "Show All Threads" : "My Threads"}
            </button>
            <button
              onClick={() => {
                setShowForm(true);
                setFormError(null);
                setForm({ title: "", content: "" });
              }}
              className="text-white bg-teal-700 text-sm px-4 py-2 rounded-md shadow-sm hover:bg-teal-800 transition hover:shadow-md"
            >
              + New Thread
            </button>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <Dialog open={showForm} onClose={setShowForm} className="relative z-10">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <DialogTitle
                  as="h1"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Create New Thread
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Content
                    </label>
                    <textarea
                      name="content"
                      id="content"
                      value={form.content}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    />
                  </div>
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
                        setForm({ title: "", content: "" });
                      }}
                      disabled={isSubmitting}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span>{isSubmitting ? 'Creating...' : 'Create Thread'}</span>
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </div>
        </Dialog>

        {/* Threads List */}
        <div className="space-y-4">
          {visibleThreads.length === 0 ? (
            <p>No threads yet</p>
          ) : (
            visibleThreads.map((t) => (
              <Link
                key={t._id}
                to={`/threads/${t._id}`}
                className="flex items-start bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:border-green-800 hover:bg-green-50 transition shadow-md transition border"
              >
                {/* Icon */}
                {/* <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 ${thread.color}`}> */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 bg-green-200 text-teal-700`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1v3l3-3h8a2 2 0 002-2z" />
                  </svg>
                </div>
                {/* Thread Info */}
                <div className="flex-1 text-left">
                  <h2 className="text-md font-semibold text-gray-900">
                    {t.title}
                  </h2>
                  {/*<p className="text-sm text-gray-600">{t.content}</p>*/}
                  <p className="text-sm mt-1 text-blue-500">
                    By: {t.author}{" "}
                    <span className="text-gray-400">
                      • {formatDistanceToNow(parseISO(t.date), { addSuffix: true })}
                    </span>
                  </p>
                </div>
                {/* Upvotes + Replies */}
                <div className="ml-3 flex flex-col items-center justify-center text-sm text-gray-500 whitespace-nowrap">
                  {/* Upvotes */}
                  <div className="flex items-center gap-1 mr-1 min-w-[48px] justify-between">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 10h4v10h6V10h4L10 0 3 10z" />
                    </svg>
                    <span data-testid="upvotes" className="font-mono text-right w-7">{t.upvotes}</span>
                  </div>
                  {/* Replies */}
                  <div className="flex items-center gap-1 mt-1 mr-0.5 min-w-[48px] justify-between">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1v3l3-3h8a2 2 0 002-2z" />
                    </svg>
                    <span data-testid="replies" className="font-mono text-right w-7">
                      {t.replies ?? 0}
                    </span>
                  </div>
                  {/* Flag */}
                  {t.upvotes <= -10 && (
                    <div
                      className="mt-2 -ml-3 flex justify-center items-center min-w-[48px]"
                      title="Flagged Thread"
                    >
                      <svg
                        className="w-5 h-5 mr-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <rect x="3" y="2" width="2" height="20" fill="#EF4444" />
                          <path
                            d="M5 4H19C19.5523 4 20 4.44772 20 5V14C20 14.5523 19.5523 15 19 15H5"
                            fill="#EF4444"
                          />
                        </g>
                      </svg>
                      {/* Flagged */}
                    </div>
                  )}
                  {/* Bin */}
                  {t.author === user?.username && ( // updated logic to check if current user is author, fixes bug where delete button does not appear
                    <button
                      className="mt-2 -ml-3 text-red-500 hover:text-red-700 transition min-w-[48px] flex justify-center"
                      title="Delete Thread"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent link navigation
                        handleDelete(t._id);
                      }}
                    >
                      <svg
                        className="w-5 h-5 mr-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 3V4H4V6H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V6H20V4H15V3H9ZM7 6H17V20H7V6ZM9 8V18H11V8H9ZM13 8V18H15V8H13Z" />
                      </svg>
                      {/* Delete */}
                    </button>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Forum;
