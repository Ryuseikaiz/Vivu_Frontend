import React, { useState } from 'react';
import './FeedbackButton.css';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFacebookClick = () => {
    window.open('https://www.facebook.com/vivuvivuv1', '_blank', 'noopener,noreferrer');
  };

  const handleDirectFeedback = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button 
        className="feedback-floating-btn"
        onClick={handleDirectFeedback}
        title="Gửi feedback"
      >
        💬 Feedback
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="feedback-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button className="feedback-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>

            <h2>📢 Gửi Feedback cho chúng tôi</h2>
            <p className="feedback-subtitle">Chúng tôi rất mong nhận được ý kiến của bạn!</p>

            <div className="feedback-options">
              <button 
                className="feedback-option facebook"
                onClick={handleFacebookClick}
              >
                <span className="feedback-icon">👍</span>
                <div className="feedback-option-content">
                  <h3>Facebook Fanpage</h3>
                  <p>Nhắn tin trực tiếp cho chúng tôi</p>
                </div>
                <span className="feedback-arrow">→</span>
              </button>

              <a 
                href="mailto:support@vivu.travel?subject=Feedback từ Vivu Travel&body=Xin chào Vivu Team,%0D%0A%0D%0ATôi muốn gửi feedback về:%0D%0A"
                className="feedback-option email"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="feedback-icon">✉️</span>
                <div className="feedback-option-content">
                  <h3>Email</h3>
                  <p>support@vivu.travel</p>
                </div>
                <span className="feedback-arrow">→</span>
              </a>

              <div className="feedback-divider">
                <span>hoặc</span>
              </div>

              <form className="feedback-form" onSubmit={(e) => {
                e.preventDefault();
                alert('Cảm ơn feedback của bạn! Chúng tôi sẽ liên hệ sớm.');
                setIsOpen(false);
              }}>
                <textarea
                  className="feedback-textarea"
                  placeholder="Viết feedback của bạn tại đây..."
                  rows="4"
                  required
                ></textarea>
                <button type="submit" className="feedback-submit">
                  Gửi Feedback
                </button>
              </form>
            </div>

            <div className="feedback-footer">
              <p>🌟 Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
