import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { authApi, backgroundApi, giftCardApi, imageApi, userApi } from '../services/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleTest = async (endpoint: string) => {
    try {
      let result;
      switch (endpoint) {
        case 'wallet-status':
          result = await authApi.checkWallet(walletAddress);
          break;
        case 'login':
          result = await authApi.login(walletAddress, signature);
          break;
        case 'create-background':
          result = await backgroundApi.create({
            imageURI: 'https://static.vecteezy.com/system/resources/previews/019/860/272/large_2x/geometric-nature-frame-with-leaves-transparent-background-illustration-png.png',
            category: 'Nature'
          });
          break;
        case 'upload-image':
          if (!imageFile) throw new Error('No image selected');
          result = await imageApi.upload(imageFile);
          break;
        case 'create-gift-card':
          result = await giftCardApi.create({
            backgroundId: 1,
            price: 100,
            message: 'Test gift card'
          });
          break;
        case 'get-user':
          result = await userApi.get(walletAddress);
          break;
      }
      
      setTestResults(prev => [...prev, `✅ ${endpoint}: Success - ${JSON.stringify(result.data)}`]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ ${endpoint}: Error - ${error.message}`]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">API Test Interface</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Wallet Connection</h2>
        <div className="space-y-2">
          <Input
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
          <Input
            placeholder="Enter signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
          <Button onClick={() => handleTest('wallet-status')}>
            Check Wallet Status
          </Button>
          <Button onClick={() => handleTest('login')}>
            Login with Wallet
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Background Operations</h2>
        <Button onClick={() => handleTest('create-background')}>
          Create Background
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Image Upload</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <Button onClick={() => handleTest('upload-image')}>
          Upload Image
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Gift Card Operations</h2>
        <Button onClick={() => handleTest('create-gift-card')}>
          Create Gift Card
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">User Operations</h2>
        <Button onClick={() => handleTest('get-user')}>
          Get User Details
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Test Results</h2>
        <div className="mt-4 space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="text-sm">
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
