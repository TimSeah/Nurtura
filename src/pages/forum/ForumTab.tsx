import React, { useState, useEffect } from "react";
import { apiService } from "../../services/apiService";

interface Thread {
  _id: string;
  title: string;
  description: string;
  author: string;
  timeAgo?: string;
  createdAt: string;
  replies?: number;
  upvotes?: number;
  color?: string;
}

const ForumTab: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const threadsData = await apiService.getThreads();
      setThreads(threadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load threads");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  };

  const getThreadColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading threads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Error: {error}</div>
        <button
          onClick={loadThreads}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl text-gray-800">Forum</h1>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition">
          + New Thread
        </button>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No threads found. Be the first to start a discussion!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread, index) => (
            <div
              key={thread._id}
              className="flex items-start bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border"
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 ${getThreadColor(
                  index
                )}`}
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
              <div className="flex-1">
                <h2 className="text-md font-semibold text-gray-900">
                  {thread.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {thread.description}
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-3 space-x-4">
                  <span>{thread.author}</span>
                  <span>{getTimeAgo(thread.createdAt)}</span>
                  {thread.replies !== undefined && (
                    <span className="flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1v3l3-3h8a2 2 0 002-2z" />
                      </svg>
                      <span>{thread.replies} replies</span>
                    </span>
                  )}
                  {thread.upvotes !== undefined && (
                    <span className="flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{thread.upvotes}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumTab;
