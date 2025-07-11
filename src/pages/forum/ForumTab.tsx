import React from "react";

// Define the thread type
interface Thread {
  id: number;
  title: string;
  description: string;
  author: string;
  timeAgo: string;
  replies: number;
  upvotes: number;
}

// Dummy data typed as Thread[]
const dummyThreads: Thread[] = [
  {
    id: 1,
    title: "Medication Management Help",
    description: "Share tips for organizing and managing medications.",
    author: "Sarah",
    timeAgo: "5h ago",
    replies: 5,
    upvotes: 10,
  },
  {
    id: 2,
    title: "Caring for Elderly Parents",
    description: "Discuss emotional and practical challenges.",
    author: "Ann2",
    timeAgo: "1 day ago",
    replies: 4,
    upvotes: 6,
  },
  {
    id: 3,
    title: "Dealing with Caregiver Stress",
    description: "What are your coping strategies?",
    author: "Care4U",
    timeAgo: "1 week ago",
    replies: 8,
    upvotes: 12,
  },
];

<div className="bg-green-500 text-white p-4 rounded">
  Tailwind is working!
</div>

// Typed React FC
const ForumTab: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Forum</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          + New Thread
        </button>
      </div>

      <div className="space-y-4">
        {dummyThreads.map((thread) => (
          <div
            key={thread.id}
            className="flex items-start p-4 bg-white rounded shadow hover:shadow-md border"
          >
            <div className="text-3xl mr-4 mt-1">💬</div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">{thread.title}</h2>
              <p className="text-gray-600">{thread.description}</p>
              <p className="text-sm text-blue-500 mt-1">
                Re: {thread.author} <span className="text-gray-400">• {thread.timeAgo}</span>
              </p>
            </div>

            <div className="ml-4 flex flex-col items-center justify-center text-sm text-gray-500 whitespace-nowrap">
              <span>⬆️ {thread.upvotes}</span>
              <span>💬 {thread.replies}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumTab;
