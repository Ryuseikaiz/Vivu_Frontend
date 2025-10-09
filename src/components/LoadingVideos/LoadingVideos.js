import React, { useState, useEffect } from 'react';
import './LoadingVideos.css';

// Danh sách video du lịch từ YouTube (embed links)
const TRAVEL_VIDEOS = [
  {
    id: 'BSPkUcW_nhQ',
    title: 'Phú Quốc - Thiên đường biển đảo Việt Nam',
    thumbnail: 'https://i.ytimg.com/vi/BSPkUcW_nhQ/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLAIw-RKF1KkdrH80IhKkhhxFipICQ'
  },
  {
    id: 'GNZ_SedoZYo',
    title: 'Hà Nội - Thủ đô ngàn năm văn hiến',
    thumbnail: 'https://i.ytimg.com/vi/GNZ_SedoZYo/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLDyRV_MFyr3T1tX-Y3zO7wy0zp5yw'
  },
];

const LoadingVideos = () => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Chọn video ngẫu nhiên khi component mount
    const randomIndex = Math.floor(Math.random() * TRAVEL_VIDEOS.length);
    setCurrentVideo(TRAVEL_VIDEOS[randomIndex]);

    // Giả lập loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95; // Dừng ở 95% để chờ response thực sự
        }
        return prev + Math.random() * 3;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  if (!currentVideo) return null;

  return (
    <div className="loading-videos">
      <div className="loading-videos__container">
        <div className="loading-videos__header">
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
          <h2 className="loading-title">✈️ Đang tạo kế hoạch du lịch hoàn hảo cho bạn...</h2>
          <p className="loading-subtitle">
            Trong lúc chờ đợi, hãy cùng khám phá điểm đến tuyệt vời này! 🌟
          </p>
        </div>

        <div className="video-container">
          <div className="video-wrapper">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              title={currentVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="video-info">
            <h3>{currentVideo.title}</h3>
          </div>
        </div>

        <div className="loading-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {loadingProgress < 30 && '🔍 Đang phân tích yêu cầu của bạn...'}
            {loadingProgress >= 30 && loadingProgress < 60 && '✈️ Đang tìm kiếm chuyến bay và khách sạn...'}
            {loadingProgress >= 60 && loadingProgress < 85 && '🍜 Đang tìm nhà hàng và địa điểm tham quan...'}
            {loadingProgress >= 85 && '🎨 Đang hoàn thiện kế hoạch du lịch...'}
          </p>
        </div>

        <div className="loading-tips">
          <h4>💡 Mẹo du lịch hữu ích:</h4>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">📱</span>
              <p>Tải bản đồ offline trước khi đi để tiết kiệm data và không lo lạc đường</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">💰</span>
              <p>Đặt vé máy bay và khách sạn sớm để được giá tốt nhất</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🎒</span>
              <p>Mang theo thuốc cơ bản và bảo hiểm du lịch để yên tâm hơn</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🍽️</span>
              <p>Đừng ngại thử món ăn địa phương tại các quán ăn đông khách</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingVideos;
