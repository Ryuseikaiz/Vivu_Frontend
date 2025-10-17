import React, { useEffect } from 'react';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, place, reviews, loading, error }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="review-modal-header">
          <h2>{place?.name}</h2>
          {place?.rating && (
            <div className="review-modal-rating">
              <span className="rating-stars">{renderStars(Math.round(place.rating))}</span>
              <span className="rating-value">{place.rating.toFixed(1)}</span>
              {place.user_ratings_total && (
                <span className="rating-count">({place.user_ratings_total} đánh giá)</span>
              )}
            </div>
          )}
        </div>

        <div className="review-modal-body">
          {loading && (
            <div className="review-loading">
              <div className="spinner"></div>
              <p>Đang tải đánh giá...</p>
            </div>
          )}

          {error && (
            <div className="review-error">
              <p>❌ {error}</p>
            </div>
          )}

          {!loading && !error && reviews && reviews.length === 0 && (
            <div className="review-empty">
              <p>📝 Chưa có đánh giá nào cho địa điểm này.</p>
            </div>
          )}

          {!loading && !error && reviews && reviews.length > 0 && (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="review-author">
                      {review.profile_photo_url ? (
                        <img
                          src={review.profile_photo_url}
                          alt={review.author_name}
                          className="author-avatar"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="author-avatar-placeholder"
                        style={{ display: review.profile_photo_url ? 'none' : 'flex' }}
                      >
                        {review.author_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="author-info">
                        <h4>{review.author_name}</h4>
                        <div className="review-meta">
                          <span className="review-stars">
                            {renderStars(review.rating)}
                          </span>
                          <span className="review-date">
                            {formatDate(review.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {review.text && (
                    <p className="review-text">{review.text}</p>
                  )}

                  {review.translated && (
                    <p className="review-translated">
                      <em>Dịch: {review.translated}</em>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
