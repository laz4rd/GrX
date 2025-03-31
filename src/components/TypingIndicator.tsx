
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex mb-2 justify-start">
      <div className="chat-bubble-other py-3">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
