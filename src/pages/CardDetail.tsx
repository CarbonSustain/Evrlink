import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const CardDetail: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('crypto');

  // Mock card data - In real app, fetch from API
  const card = {
    id: cardId,
    title: 'Happy Birthday Bloom',
    image: '/images/cards/birthday-1.jpg',
    price: 1.60,
    creator: 'Artist Name',
    creatorEarnings: '40%',
    description: 'A beautiful digital birthday card with animated flowers',
    preview: '/images/cards/birthday-1-preview.gif'
  };

  const handleSend = async () => {
    // Implement sending logic here
    console.log('Sending card with message:', message);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Card Preview */}
            <div className="md:w-1/2">
              <div className="relative h-96">
                <img
                  src={card.preview}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full">
                  ${card.price}
                </div>
              </div>
            </div>

            {/* Card Details and Actions */}
            <div className="md:w-1/2 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{card.title}</h1>
              <p className="text-gray-600 mb-6">{card.description}</p>

              {/* Personal Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add your personal message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Write your message here..."
                />
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="crypto"
                      checked={paymentMethod === 'crypto'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Pay with Crypto (USDC/ETH)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Pay with Credit Card
                  </label>
                </div>
              </div>

              {/* Creator Info */}
              <div className="text-sm text-gray-500 mb-6">
                <p>Created by: {card.creator}</p>
                <p>Creator Earnings: {card.creatorEarnings}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSend}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Send Card
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back to Cards
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
