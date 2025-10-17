import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './MessengerChat.css';

const MessengerChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Xin chào! Tôi là chatbot của Vivu Travel. Bạn có muốn chat với trợ lý AI thay vì chat qua Facebook Messenger không? 🤖',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAIMode, setIsAIMode] = useState(null); // null, true, false
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('User location obtained:', position.coords);
        },
        (error) => {
          console.log('Location permission denied:', error);
        }
      );
    }
  }, []);

  const handleOpenMessenger = () => {
    // Open Facebook Messenger for page
    window.open('https://m.me/vivuvivuv1', '_blank', 'noopener,noreferrer');
  };

  const handleChooseAI = () => {
    setIsAIMode(true);
    setMessages(prev => [...prev, {
      type: 'bot',
      text: '🤖 Tuyệt vời! Bây giờ bạn đang chat với trợ lý AI của Vivu. Tôi có thể giúp gì cho bạn?',
      timestamp: new Date()
    }]);
  };

  const handleChooseMessenger = () => {
    setIsAIMode(false);
    setMessages(prev => [...prev, {
      type: 'bot',
      text: '👍 Đang chuyển bạn sang Facebook Messenger...',
      timestamp: new Date()
    }]);
    setTimeout(() => {
      handleOpenMessenger();
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    }]);

    if (isAIMode === null) {
      // Show choice again
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Vui lòng chọn chat với AI hoặc Facebook Messenger bên dưới trước nhé! 😊',
        timestamp: new Date()
      }]);
      return;
    }

    if (isAIMode === false) {
      // Redirect to messenger
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Vui lòng chat với chúng tôi qua Facebook Messenger để được hỗ trợ tốt hơn!',
        timestamp: new Date()
      }]);
      return;
    }

    // Call Gemini AI
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/chat/gemini', {
        message: userMessage,
        context: 'vivu_travel_support',
        userLocation: userLocation // Send user location if available
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setMessages(prev => [...prev, {
        type: 'bot',
        text: response.data.reply || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.',
        timestamp: new Date(),
        nearbyPlaces: response.data.nearbyPlaces // Attach nearby places if returned
      }]);
    } catch (error) {
      console.error('Error calling AI:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại hoặc chat qua Facebook Messenger!',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`messenger-chat-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="messenger-chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">✈️</div>
              <div>
                <h3>Vivu Travel Support</h3>
                <span className="chat-status">● Online</span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.type}`}>
                <div className="message-content">
                  {/* Render HTML for bot messages (for hyperlinks), plain text for user */}
                  {msg.type === 'bot' ? (
                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                  ) : (
                    msg.text
                  )}
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chat-message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Choice Buttons (if not chosen yet) */}
          {isAIMode === null && (
            <div className="chat-choices">
              <button className="choice-btn ai" onClick={handleChooseAI}>
                <span className="choice-icon">🤖</span>
                <span>Chat với AI</span>
              </button>
              <button className="choice-btn messenger" onClick={handleChooseMessenger}>
                <span className="choice-icon">💬</span>
                <span>Chat qua Messenger</span>
              </button>
            </div>
          )}

          {/* Input */}
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder={isAIMode === null ? 'Chọn phương thức chat...' : 'Nhập tin nhắn...'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isAIMode === null || isAIMode === false}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={!inputMessage.trim() || isLoading || isAIMode === null || isAIMode === false}
            >
              ➤
            </button>
          </form>

          {/* Footer */}
          <div className="chat-footer">
            {isAIMode === true && (
              <button className="switch-mode-btn" onClick={handleChooseMessenger}>
                Chuyển sang Messenger
              </button>
            )}
            {isAIMode === false && (
              <button className="switch-mode-btn" onClick={handleChooseAI}>
                Quay lại AI
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MessengerChat;
