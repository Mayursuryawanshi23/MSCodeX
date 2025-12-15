import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';

const Share = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const res = await fetch(`${api_base_url}/share/${shareId}`, {
          mode: 'cors',
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        if (data.success) {
          setShareData(data.share);
        } else {
          setError(data.msg || 'Failed to load shared code');
        }
      } catch (err) {
        setError('Error loading shared code');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchShare();
    }
  }, [shareId]);

  const copyToClipboard = () => {
    if (shareData?.code) {
      navigator.clipboard.writeText(shareData.code).then(() => {
        toast.success('Code copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy');
      });
    }
  };

  const downloadCode = () => {
    if (shareData?.code) {
      const blob = new Blob([shareData.code], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = shareData.fileName || 'code.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Code downloaded!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg">Loading shared code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-lg text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-950 border-b border-gray-800/50 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
            🔗 Shared Code
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {shareData?.fileName} • {shareData?.language?.toUpperCase()} • Views: {shareData?.viewCount || 0}
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm rounded transition-all duration-200"
            title="Copy code"
          >
            📋 Copy
          </button>
          <button
            onClick={downloadCode}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm rounded transition-all duration-200"
            title="Download code"
          >
            💾 Download
          </button>
          <button
            onClick={() => navigate('/home')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs sm:text-sm rounded transition-all duration-200"
            title="Back to home"
          >
            🏠 Home
          </button>
        </div>
      </div>

      {/* Code Editor - Read Only */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        <div className="bg-black border border-green-500/20 rounded-lg overflow-hidden h-full shadow-lg">
          <Editor
            height="100%"
            defaultLanguage={shareData?.language || 'javascript'}
            defaultValue={shareData?.code || '// Code not available'}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on'
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-950 border-t border-gray-800/50 px-4 sm:px-8 py-3 text-center text-gray-400 text-xs">
        <p>This is a read-only view of shared code. To edit, create your own project in CatalyX.</p>
      </div>
    </div>
  );
};

export default Share;
