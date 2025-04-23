import React, { useState } from 'react';
import './GiftCard.css';

interface GiftCardProps {
  cardType: string;
  message: string;
  value: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

const GiftCard: React.FC<GiftCardProps> = ({ cardType, message, value, theme }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="gift-card-wrapper">
      <div 
        className={`gift-card-container ${isFlipped ? 'flipped' : ''}`}
        onClick={handleCardClick}
      >
        <div className="gift-card">
          <div 
            className="card-front"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
            }}
          >
            <div className="card-content front">
              <h2>{cardType}</h2>
              <div className="card-decoration">
                <div className="shine"></div>
              </div>
              <div className="click-hint">
                Click to reveal your gift
              </div>
            </div>
          </div>
          <div 
            className="card-back"
            style={{
              background: `linear-gradient(45deg, ${theme.secondaryColor}, ${theme.primaryColor})`
            }}
          >
            <div className="card-content back">
              <div className="message">
                {message}
              </div>
              <div className="value">
                Value: {value}
              </div>
              <div className="decorative-pattern"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCard; 