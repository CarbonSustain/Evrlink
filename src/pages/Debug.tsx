import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/services/api';
import axios from 'axios';
import Navbar from '@/components/Navbar';

const Debug: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [envVars, setEnvVars] = useState<Record<string, any>>({});

  useEffect(() => {
    // Collect environment variables
    const vars: Record<string, any> = {
      'API_BASE_URL': API_BASE_URL,
      'import.meta.env.VITE_API_URL': import.meta.env?.VITE_API_URL,
      'process.env.REACT_APP_API_URL': process.env?.REACT_APP_API_URL,
      'process.env.VITE_API_URL': process.env?.VITE_API_URL,
      'NODE_ENV': process.env.NODE_ENV,
      'import.meta.env.MODE': import.meta.env?.MODE,
      'Window Properties': Object.keys(window).filter(key => key.includes('VITE') || key.includes('API'))
    };
    setEnvVars(vars);

    // Test API connectivity
    const testApi = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/backgrounds/test`);
        setApiStatus('success');
        setApiResponse(response.data);
      } catch (error) {
        console.error('API test failed:', error);
        setApiStatus('error');
        setApiResponse(error);
      }
    };

    testApi();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B14]">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 mt-20">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Debug Information</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Environment Variables</h2>
            <pre className="bg-black/30 p-4 rounded-lg text-gray-200 overflow-x-auto">
              {JSON.stringify(envVars, null, 2)}
            </pre>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">API Connectivity Test</h2>
            <div className="flex items-center mb-4">
              <span className="mr-2">Status:</span>
              {apiStatus === 'loading' && <span className="text-yellow-400">Testing connection...</span>}
              {apiStatus === 'success' && <span className="text-green-400">Connected successfully</span>}
              {apiStatus === 'error' && <span className="text-red-400">Connection failed</span>}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Response:</h3>
              <pre className="bg-black/30 p-4 rounded-lg text-gray-200 overflow-x-auto">
                {apiResponse ? JSON.stringify(apiResponse, null, 2) : 'No response'}
              </pre>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Browser Information</h2>
              <ul className="space-y-2">
                <li><span className="text-gray-400">User Agent:</span> {navigator.userAgent}</li>
                <li><span className="text-gray-400">Window Size:</span> {window.innerWidth} x {window.innerHeight}</li>
                <li><span className="text-gray-400">Device Pixel Ratio:</span> {window.devicePixelRatio}</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Troubleshooting Tips</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Make sure your backend server is running</li>
                <li>Check that CORS is properly configured on the backend</li>
                <li>Verify API_BASE_URL is correctly set to your backend URL</li>
                <li>Clear browser cache and reload</li>
                <li>Check browser console for errors</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary/80 hover:bg-primary transition-colors text-white rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Debug; 