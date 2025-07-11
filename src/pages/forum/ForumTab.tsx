import React from "react";

interface Thread {
  id: number;
  title: string;
  description: string;
  author: string;
  timeAgo: string;
  replies: number;
  upvotes: number;
  color: string; // blue, green, etc.
}

const dummyThreads: Thread[] = [
  {
    id: 1,
    title: "Medication Management Help",
    description: "Share tips for organizing and managing medications.",
    author: "Sarah",
    timeAgo: "5h ago",
    replies: 5,
    upvotes: 5,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "Caring for Elderly Parents",
    description: "Discussion on challenges and solutions",
    author: "Ann2",
    timeAgo: "1 day ago",
    replies: 4,
    upvotes: 3,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 3,
    title: "Assistive Devices",
    description: "Recommendations for useful assistive devices",
    author: "Jacob",
    timeAgo: "3 days ago",
    replies: 6,
    upvotes: 5,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 4,
    title: "Dealing with Caregiver Stress",
    description: "How do you handle stress as a caregiver?",
    author: "Care4U",
    timeAgo: "1 week ago",
    replies: 8,
    upvotes: 12,
    color: "bg-green-100 text-green-600",
  },
];

const ForumTab: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Forum</h1>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition">
          + New Thread
        </button>
      </div>

      <div className="space-y-4">
        {dummyThreads.map((thread) => (
          <div
            key={thread.id}
            className="flex items-start bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border"
          >
            {/* Icon */}
            <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 ${thread.color}`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1v3l3-3h8a2 2 0 002-2z" />
              </svg>
            </div>

            {/* Thread Info */}
            <div className="flex-1">
              <h2 className="text-md font-semibold text-gray-900">{thread.title}</h2>
              <p className="text-sm text-gray-600">{thread.description}</p>
              <p className="text-sm mt-1 text-blue-500">
                Re: {thread.author} <span className="text-gray-400">• {thread.timeAgo}</span>
              </p>
            </div>

            {/* Upvotes + Replies */}
            <div className="ml-4 flex flex-col items-center justify-center text-sm text-gray-500 whitespace-nowrap">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 10h4v10h6V10h4L10 0 3 10z" />
                </svg>
                {thread.upvotes}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1v3l3-3h8a2 2 0 002-2z" />
                </svg>
                {thread.replies}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumTab;
