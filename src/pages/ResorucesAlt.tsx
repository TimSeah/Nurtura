import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Resource {
  _id: string;
  title: string;
  description?: string;
  url: string; // 👈 matches your backend
  image?: string;
  category?: string;
  postedBy?: string;
  dateAdded?: string;
}

const ResourcesAlt: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/external-resources')
      .then(res => {
        setResources(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch external resources:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Informational Articles</h1>
      {loading ? (
        <p>Loading...</p>
      ) : resources.length === 0 ? (
        <p className="text-gray-500">No resources available.</p>
      ) : (
        resources.map(resource => (
          <div
            key={resource._id}
            className="flex justify-between items-center bg-white rounded-xl shadow p-6 mb-6"
          >
            <div className="max-w-xl">
              <p className="text-sm text-gray-500 capitalize">{resource.category || 'Resource'}</p>
              <h2 className="text-xl font-bold mt-2">{resource.title}</h2>
              <p className="text-gray-700 mt-2">{resource.description}</p>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Read More
              </a>
              {resource.postedBy && (
                <p className="text-xs text-gray-400 mt-2">Posted by {resource.postedBy}</p>
              )}
            </div>
            {resource.image && (
              <img
                src={resource.image}
                alt={resource.title}
                className="w-64 h-40 object-cover rounded-lg ml-6"
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ResourcesAlt;
