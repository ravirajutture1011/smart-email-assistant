import { useState } from 'react'
import './App.css'

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      console.log("printing data : " + emailContent);
      console.log("printing data : " + tone);
      const response = await fetch("http://localhost:5000/api/email", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content:emailContent, tone }),
      });

      const data = await response.json();
      // const result = typeof data === 'string' ? data : JSON.stringify(data);
      setGeneratedReply(data.result);
      console.log(data.result);
    } catch (error) {
      setError('Failed to generate email reply. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-amber-600">Email Reply Generator</h1>

      <div className="mb-4">
        <label className="block font-medium mb-2">Original Email Content</label>
        <textarea
          rows="6"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-amber-400"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Tone (Optional)</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-amber-400"
        >
          <option value="">None</option>
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="friendly">Friendly</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!emailContent || loading}
        className="w-full bg-amber-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-amber-600 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Reply'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {generatedReply && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Reply:</h2>
          <textarea
            rows="6"
            readOnly
            value={generatedReply}
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          />
          <button
            onClick={() => navigator.clipboard.writeText(generatedReply)}
            className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
