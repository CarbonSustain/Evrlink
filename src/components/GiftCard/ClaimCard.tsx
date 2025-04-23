import React from 'react';
import './ClaimCard.css';

interface ClaimCardProps {
  title: string;
  message?: string;
  value?: string;
  isFlipped: boolean;
  onClick: () => void;
}

const ClaimCard: React.FC<ClaimCardProps> = ({
  title,
  message,
  value,
  isFlipped,
  onClick,
}) => {
  return (
    <div className="gift-card-wrapper">
      <div 
        className={`gift-card-container ${isFlipped ? 'flipped' : ''}`}
        onClick={onClick}
      >
        <div className="gift-card">
          <div className="card-front">
            <div className="card-content">
              <h2>{title}</h2>
              <div className="click-hint">Click to reveal your gift</div>
            </div>
            <div className="shine"></div>
          </div>
          <div className="card-back">
            <div className="card-content">
              {message && <div className="message">{message}</div>}
              {value && <div className="value">{value}</div>}
            </div>
            <div className="shine"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimCard; 