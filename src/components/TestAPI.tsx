import React, { useState, useEffect } from 'react';

const TestAPI: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API...');
        const response = await fetch('http://localhost:5000/api/care-recipients');
        console.log('Response:', response);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Result:', result);
        setData(result);
      } catch (err) {
        console.error('API Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) return <div>Testing API...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>API Test Results:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestAPI;
