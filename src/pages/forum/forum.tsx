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
import "./Forum.css";
import { Link } from "react-router-dom";
import { calculateDaysAgo } from "../../utils/calDaysAgoUtil";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const currentUser = "A good grandkid";

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
        (t) => t.author === user?.email || t.author === user?.username
      ) // for "My Threads" button to work
    : sortedThreads;

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/threads", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data: Thread[] = await res.json();
      setThreads(data);
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
  };

  console.log("Creating thread with author:", user?.username, user?.email);
  console.log("Request payload:", {
    title: form.title,
    content: form.content,
    author: user?.username || user?.email || "Anonymous",
    date: new Date().toISOString(),
    upvotes: 0,
  });
  console.log("user =", user);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      setFormError("Title and content are required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          author: user?.username || user?.email || "Anonymous",
          date: new Date().toISOString(),
          upvotes: 0,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      const newThread: Thread = await res.json();

      setShowForm(false);
      setThreads((prev) => [...prev, newThread]);
      setForm({ title: "", content: "" });

      await fetchThreads();
    } catch (err: any) {
      console.error("Failed to create thread:", err);
      alert(`Failed to create thread: ${err}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (user?.email !== threads.find((t) => t._id === id)?.author) return;
    if (!window.confirm("Are you sure you want to delete this thread?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/threads/${id}`, {
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
        <div className="flex justify-between items-center mb-6">
          {/* <h1 className="text-3xl font-bold text-gray-800">Forum</h1> */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition"
            >
              + New Thread
            </button>
            <button
              onClick={() => setShowUserThreads((prev) => !prev)}
              className={`${
                showUserThreads
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "bg-gray-200 hover:bg-gray-300"
              } text-sm px-4 py-2 rounded-md shadow-sm transition`}
            >
              {showUserThreads ? "Show All Threads" : "My Threads"}
            </button>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="ml-1 text-[8px] bg-gray-200 h-13 px-2 pt-1 border border-gray-400 shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="comments">Most Comments</option>
              <option value="likes">Most Upvotes</option>
            </select>
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
                  {formError && <p className="text-red-600">{formError}</p>}
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Create Thread
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
                className="flex items-start bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border"
              >
                {/* Icon */}
                {/* <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 ${thread.color}`}> */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 bg-blue-100 text-blue-600`}
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
                      • {calculateDaysAgo(t.date)}
                    </span>
                  </p>
                </div>
                {/* Upvotes + Replies */}
                <div className="ml-4 flex flex-col items-center justify-center text-sm text-gray-500 whitespace-nowrap">
                  <button type="button" className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 10h4v10h6V10h4L10 0 3 10z" />
                    </svg>
                    {t.upvotes}
                  </button>
                  <div className="flex items-center gap-1 mt-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1v3l3-3h8a2 2 0 002-2z" />
                    </svg>
                    {t.replies} {/* replies */}
                  </div>
                  {(t.author === user?.email ||
                    t.author === user?.username) && ( // updated logic to check if current user is author, fixes bug where delete button does not appear
                    <button
                      className="mt-2 -ml-3 text-red-500 hover:text-red-700 transition"
                      title="Delete Thread"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent link navigation
                        handleDelete(t._id);
                      }}
                    >
                      <svg
                        className="w-5 h-5"
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
